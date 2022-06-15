import {createContext, FunctionComponent, ReactElement, useContext, useEffect, useMemo} from 'react';
import {Configuration, Plug} from '@croct/plug';
import {croct} from './ssr-polyfills';

export type CroctProviderProps = Configuration & Required<Pick<Configuration, 'appId'>> & {
    children?: ReactElement,
};

export const CroctContext = createContext<{plug: Plug}|null>(null);
CroctContext.displayName = 'CroctContext';

export const CroctProvider: FunctionComponent<CroctProviderProps> = ({children, ...configuration}): ReactElement => {
    const parent = useContext(CroctContext);

    if (parent !== null) {
        throw new Error(
            'You cannot render <CroctProvider> inside another <CroctProvider>. '
            + 'Croct should only be initialized once in the application.',
        );
    }

    const context = useMemo(() => ({
        get plug() {
            if (!croct.initialized) {
                croct.plug(configuration);
            }

            return croct;
        },
    }), [configuration]);

    useEffect(() => {
        croct.plug(configuration);

        return () => {
            croct.unplug();
        };
    }, []);

    return (
        <CroctContext.Provider value={context}>
            {children}
        </CroctContext.Provider>
    );
};
