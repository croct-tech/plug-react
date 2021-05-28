import React, {ReactElement} from 'react';
import {AppProps} from 'next/app';
import Head from 'next/head';
import {CroctProvider} from '@croct/plug-react';
import '../styles/globals.css';
import Layout from '../components/Layout';

function App({Component, pageProps}: AppProps): ReactElement {
    return (
        <CroctProvider appId="00000000-0000-0000-0000-000000000000">
            <Head>
                <link rel="icon" href="/favicon.svg" />
                <meta
                    name="description"
                    content="Example of how to integrate Croct into React applications rendered on the client-side."
                />
                <title>Croct | React Next.js Example</title>
                <script src="https://cdn.croct.io/js/v1/app/00000000-0000-0000-0000-000000000000/custom.js" />
            </Head>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </CroctProvider>
    );
}

export default App;
