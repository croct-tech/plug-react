import {PropsWithChildren, ReactElement} from 'react';
import {CroctProvider} from '@croct/plug-react/CroctProvider';
import {headers} from 'next/headers';
import {CLIENT_ID_HEADER} from '@/lib/constants';

export function Providers({children}: PropsWithChildren): ReactElement {
    return (
        <CroctProvider
            debug
            appId={process.env.NEXT_PUBLIC_CROCT_APP_ID!}
            clientId={headers().get(CLIENT_ID_HEADER)!}
        >
            {children}
        </CroctProvider>
    );
}
