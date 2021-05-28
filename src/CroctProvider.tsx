import {createContext, FunctionComponent, ReactElement, useContext} from 'react';
import {Configuration, Plug} from '@croct/plug';
import {croct, useIsomorphicEffect} from './ssr-polyfills';

export const CroctContext = createContext<Plug|null>(null);
CroctContext.displayName = 'CroctContext';

export type CroctProviderProps = Configuration & Required<Pick<Configuration, 'appId'>>;

export const CroctProvider: FunctionComponent<CroctProviderProps> = ({children, ...configuration}): ReactElement => {
    const parent = useContext(CroctContext);

    if (parent !== null) {
        throw new Error(
            'You cannot render <CroctProvider> inside another <CroctProvider>. '
            + 'Croct should only be initialized once in the application.',
        );
    }

    useIsomorphicEffect(() => {
        croct.plug(configuration);

        return () => {
            croct.unplug();
        };
    }, []);

    return (
        <CroctContext.Provider value={croct}>
            {children}
        </CroctContext.Provider>
    );
};
