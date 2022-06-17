import React from 'react';
import ReactDOM from 'react-dom/client';
import {CroctProvider} from '@croct/plug-react';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <CroctProvider appId="00000000-0000-0000-0000-000000000000">
            <App />
        </CroctProvider>
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
