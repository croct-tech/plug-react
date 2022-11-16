import {ReactElement} from 'react';
import {Slot, SlotContent} from '@croct/plug-react';
import './style.css';

const SLOT_ID = 'home-banner@1';

type SlotProps = SlotContent<typeof SLOT_ID> & {
    loading?: boolean,
};

const defaultContent: SlotProps = {
    title: 'Experience up to 20% more revenue faster',
    subtitle: 'Deliver tailored experiences that drive satisfaction and growth.',
    cta: {
        label: 'Discover how',
        link: 'https://croct.link/demo',
    },
};

const initialContent: SlotProps = {
    ...defaultContent,
    loading: true,
};

type HomeBannerProps = {
    cacheKey?: string,
};

export default function HomeBanner({cacheKey}: HomeBannerProps): ReactElement {
    return (
        <Slot id={SLOT_ID} initial={initialContent} fallback={defaultContent} cacheKey={cacheKey}>
            {({loading = false, title, subtitle, cta}: SlotProps): ReactElement => (
                <div className={`hero${loading ? ' loading' : ''}`}>
                    <h1>{title}</h1>
                    <p className="subtitle">
                        {subtitle}
                    </p>
                    <a href={cta.link} className="cta">{cta.label}</a>
                </div>
            )}
        </Slot>
    );
}
