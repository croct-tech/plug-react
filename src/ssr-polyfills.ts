import csrPlug, {Plug} from '@croct/plug';

export function isSsr(): boolean {
    return typeof window === 'undefined'
        || typeof window.document === 'undefined'
        || typeof window.document.createElement === 'undefined';
}

export const croct: Plug = !isSsr() ? csrPlug : new Proxy(csrPlug, {
    get(_, property: keyof Plug) {
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
                    `Property croct.${String(property)} is not supported on server-side (SSR). Consider refactoring `
                    + 'the logic as a side-effect (useEffect) or a client-side callback (onClick, onChange, etc).',
                );
        }
    },
});

