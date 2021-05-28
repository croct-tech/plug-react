import csrPlug, {Plug} from '@croct/plug';

export function isSsr(): boolean {
    return typeof window === 'undefined';
}

export const croct: Plug = !isSsr() ? csrPlug : new Proxy(csrPlug, {
    get(_, property) {
        switch (property) {
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

