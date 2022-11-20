import React, {PropsWithChildren, ReactElement} from 'react';
import PersonaSelector from './PersonaSelector';

export default function Layout({children}: PropsWithChildren): ReactElement {
    return (
        <div className="container">
            <header className="header">
                <a href="https://croct.com" className="logo">
                    <img src="/logo.svg" title="Croct" alt="Croct" />
                </a>
                <PersonaSelector />
            </header>
            <div className="content">
                {children}
            </div>
        </div>
    );
}
