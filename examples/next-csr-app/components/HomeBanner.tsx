import {ReactElement} from 'react';
import {Slot, SlotContent} from '@croct/plug-react';
import {fetchStaticContent} from '@/lib/utils/fetchStaticContent';

const SLOT_ID = 'home-banner@1';

type HomeBannerSlotProps = SlotContent<typeof SLOT_ID> & {
    loading?: boolean,
};

export type HomeBannerProps = {
    defaultContent: HomeBannerSlotProps,
    cacheKey?: string,
};

export function getDefaultHomeBannerContent(): Promise<HomeBannerSlotProps> {
    return fetchStaticContent(SLOT_ID);
}

export default function HomeBanner({cacheKey, defaultContent}: HomeBannerProps): ReactElement {
    return (
        <Slot
            id={SLOT_ID}
            fallback={defaultContent}
            cacheKey={cacheKey}
            initial={{
                ...defaultContent,
                loading: true,
            }}
        >
            {({loading = false, title, subtitle, cta}: HomeBannerSlotProps): ReactElement => (
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
