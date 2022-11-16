import React, {Fragment, ReactElement} from 'react';
import HomeBanner, {preloadHomeBanner} from '@/components/HomeBanner';
import PersonaSelector, {Persona} from '@/components/PersonaSelector';
import {evaluate} from '@/lib/utils/evaluate';

export default async function Page(): Promise<ReactElement> {
    preloadHomeBanner();

    const persona = await evaluate<Persona>("user's persona or else 'default'", {
        fallback: 'default',
    });

    return (
        <Fragment>
            <header className="header">
                <a href="https://croct.com" className="logo">
                    <img src="/logo.svg" title="Croct" alt="Croct" />
                </a>
                <PersonaSelector persona={persona} />
            </header>
            <div className="content">
                {/* @ts-expect-error Server Component */}
                <HomeBanner />
            </div>
        </Fragment>
    );
}
