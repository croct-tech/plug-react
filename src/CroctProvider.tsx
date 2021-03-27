import {createContext, FunctionComponent, ReactElement, useContext, useEffect} from 'react';
import croct, {Configuration, Plug} from '@croct/plug';

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

    croct.plug(configuration);

    useEffect(() => () => {
        croct.unplug();
    }, []);

    return (
        <CroctContext.Provider value={croct}>
            {children}
        </CroctContext.Provider>
    );
};

