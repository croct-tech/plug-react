import {PropsWithChildren, ReactElement} from 'react';
import {CroctProvider} from '@croct/plug-react/CroctProvider';
import {headers} from 'next/headers';
import {Header} from '@/lib/constants';

export default function Providers({children}: PropsWithChildren): ReactElement {
    return (
        <CroctProvider
            appId={process.env.NEXT_PUBLIC_CROCT_APP_ID!}
            clientId={headers().get(Header.CLIENT_ID) ?? undefined}
        >
            {children}
        </CroctProvider>
    );
}
