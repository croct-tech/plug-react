import {plug, Plug} from '@croct/plug';

/**
 * @internal
 */
export function isSsr(): boolean {
    return globalThis.window?.document?.createElement === undefined;
}

/**
 * @internal
 */
export const croct: Plug = !isSsr()
    ? (function factory(): Plug {
        let timeoutId: ReturnType<typeof setTimeout>|null = null;
        let resolveCallback: () => void;
        let rejectCallback: (reason: any) => void;

        return new Proxy(plug, {
            get: function getProperty(target, property: keyof Plug): any {
                switch (property) {
                    case 'plug':
                        if (timeoutId !== null) {
                            clearTimeout(timeoutId);
                            timeoutId = null;
                            rejectCallback?.(new Error('Unplug cancelled.'));
                        }

                        break;

                    case 'unplug':
                        return () => {
                            // Delay unplugging to avoid reconnections between remounts (e.g. strict mode).
                            // It can be problematic when aiming to replug the SDK with a different configuration.
                            // However, since it is an unusual use case and there is a log message to warn about
                            // the plugin being already plugged, the trade-off is worth it.
                            timeoutId = setTimeout(() => target.unplug().then(resolveCallback, rejectCallback), 100);

                            return new Promise<void>((resolve, reject) => {
                                resolveCallback = resolve;
                                rejectCallback = reject;
                            });
                        };
                }

                return target[property];
            },
        });
    }())
    : new Proxy(plug, {
        get: function getProperty(_, property: keyof Plug): any {
            switch (property) {
                case 'initialized':
                    return false;

                case 'plug':
                    return () => {
                        // no-op
                    };

                case 'unplug':
                    return () => Promise.resolve();

                default:
                    throw new Error(
                        `Property croct.${String(property)} is not supported on server-side (SSR). `
                        + 'Consider refactoring  the logic as a side-effect (useEffect) or a client-side callback '
                        + '(onClick, onChange, etc). '
                        + 'For help, see https://croct.help/sdk/react/client-logic-ssr',
                    );
            }
        },
    });
