import {createContext, FunctionComponent, ReactElement, useContext, useEffect} from 'react';
import croct, {Configuration, Plug} from '@croct/plug';
import {isSsr} from './ssr';

export const CroctContext = createContext<Plug|null>(null);
CroctContext.displayName = 'CroctContext';

export type CroctProviderProps = Configuration & Required<Pick<Configuration, 'appId'>>;

const CsrProvider: FunctionComponent<CroctProviderProps> = ({children, ...configuration}): ReactElement => {
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

const SsrProvider: FunctionComponent<CroctProviderProps> = ({children}): ReactElement => {
    const ssrPlug = new Proxy(croct, {
        get(_, property) {
            throw new Error(`croct.${String(property)} is not supported on server-side (SSR).`);
        },
    });

    return (
        <CroctContext.Provider value={ssrPlug}>
            {children}
        </CroctContext.Provider>
    );
};

export const CroctProvider: FunctionComponent<CroctProviderProps> = ({children, ...props}): ReactElement => {
    const parent = useContext(CroctContext);

    if (parent !== null) {
        throw new Error(
            'You cannot render <CroctProvider> inside another <CroctProvider>. '
            + 'Croct should only be initialized once in the application.',
        );
    }

    return isSsr()
        ? <SsrProvider {...props}>{children}</SsrProvider>
        : <CsrProvider {...props}>{children}</CsrProvider>;
};

