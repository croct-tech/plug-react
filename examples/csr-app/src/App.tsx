import React, {FunctionComponent, ReactElement} from 'react';
import HomeBanner from './components/HomeBanner';
import Layout from './components/Layout';

const App: FunctionComponent = (): ReactElement => (
    <Layout>
        <HomeBanner />
    </Layout>
);

export default App;
