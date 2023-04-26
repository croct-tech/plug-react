'use client';

import {
    createContext,
    FunctionComponent,
    MutableRefObject,
    PropsWithChildren,
    ReactElement,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import {Configuration, Plug} from '@croct/plug';
import {croct} from './ssr-polyfills';

export type CroctProviderProps = PropsWithChildren<Configuration & Required<Pick<Configuration, 'appId'>>>;

export const CroctContext = createContext<{plug: Plug}|null>(null);
CroctContext.displayName = 'CroctContext';

function useLiveRef<T>(value: T): MutableRefObject<T> {
    const ref = useRef(value);

    ref.current = value;

    return ref;
}

export const CroctProvider: FunctionComponent<CroctProviderProps> = (props): ReactElement => {
    const {children, ...configuration} = props;
    const parent = useContext(CroctContext);
    const baseConfiguration = useLiveRef(configuration);

    if (parent !== null) {
        throw new Error(
            'You cannot render <CroctProvider> inside another <CroctProvider>. '
            + 'Croct should only be initialized once in the application.',
        );
    }

    const context = useMemo(
        () => ({
            get plug(): Plug {
                if (!croct.initialized) {
                    croct.plug(baseConfiguration.current);
                }

                return new Proxy(croct, {
                    get: function getProperty(target, property: keyof Plug): any {
                        if (property === 'plug') {
                            return (options: Configuration): void => {
                                croct.plug({...baseConfiguration.current, ...options});
                            };
                        }

                        return target[property];
                    },
                });
            },
        }),
        [baseConfiguration],
    );

    useEffect(
        () => {
            croct.plug(baseConfiguration.current);

            return () => {
                croct.unplug().catch(() => {
                    // Suppress errors.
                });
            };
        },
        [baseConfiguration],
    );

    return (
        <CroctContext.Provider value={context}>
            {children}
        </CroctContext.Provider>
    );
};
