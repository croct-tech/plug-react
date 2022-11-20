'use client';

import {
    createContext,
    FunctionComponent,
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

export const CroctProvider: FunctionComponent<CroctProviderProps> = (props): ReactElement => {
    const {children, ...configuration} = props;
    const parent = useContext(CroctContext);
    const initialConfiguration = useRef(configuration);

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
                    croct.plug(initialConfiguration.current);
                }

                return croct;
            },
        }),
        [],
    );

    useEffect(
        () => {
            croct.plug(initialConfiguration.current);

            return () => {
                croct.unplug();
            };
        },
        [],
    );

    return (
        <CroctContext.Provider value={context}>
            {children}
        </CroctContext.Provider>
    );
};
