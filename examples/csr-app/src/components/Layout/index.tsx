import React, {PropsWithChildren, ReactElement} from 'react';
import logo from './logo.svg';
import './style.css';
import PersonaSelector from '../PersonaSelector';

export default function Layout({children}: PropsWithChildren): ReactElement {
    return (
        <div className="container">
            <header>
                <a href="https://croct.com" className="logo">
                    <img src={logo} title="Croct" alt="Croct" />
                </a>
                <PersonaSelector />
            </header>
            <div className="content">
                {children}
            </div>
        </div>
    );
}
