import React, {Fragment, ReactElement} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import {CroctProvider} from '@croct/plug-react';
import Layout from '@/components/Layout';

export default function App({Component, pageProps}: AppProps): ReactElement {
    return (
        <Fragment>
            <Head>
                <link rel="icon" href="/favicon.svg" />
                <meta
                    name="description"
                    content="Example of how to integrate Croct into Next.js applications rendered on the client-side."
                />
                <title>Croct | React Next.js Client-side Rendering Example</title>
            </Head>
            <CroctProvider appId={process.env.NEXT_PUBLIC_CROCT_APP_ID!}>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </CroctProvider>
        </Fragment>
    );
}
