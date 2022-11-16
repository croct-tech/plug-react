import {ReactElement} from 'react';
import {SlotContent} from '@croct/plug-react';
import {fetchContent} from '@/lib/utils/fetchContent';

const SLOT_ID = 'home-banner@1';

function loadHomeBanner(): Promise<SlotContent<typeof SLOT_ID>> {
    return fetchContent(SLOT_ID, {
        fallback: {
            title: 'Experience up to 20% more revenue faster',
            subtitle: 'Deliver tailored experiences that drive satisfaction and growth.',
            cta: {
                label: 'Discover how',
                link: 'https://croct.link/demo',
            },
        },
    });
}

export function preloadHomeBanner(): void {
    void loadHomeBanner();
}

export default async function HomeBanner(): Promise<ReactElement> {
    const {title, subtitle, cta} = await loadHomeBanner();

    return (
        <div className="hero">
            <h1>{title}</h1>
            <p className="subtitle">
                {subtitle}
            </p>
            <a href={cta.link} className="cta">{cta.label}</a>
        </div>
    );
}
