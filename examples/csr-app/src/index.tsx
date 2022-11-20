import React from 'react';
import ReactDOM from 'react-dom/client';
import {CroctProvider} from '@croct/plug-react';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <CroctProvider appId="00000000-0000-0000-0000-000000000000">
            <App />
        </CroctProvider>
    </React.StrictMode>,
);
