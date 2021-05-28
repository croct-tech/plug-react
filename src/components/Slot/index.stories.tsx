import {FunctionComponent, ReactElement, Suspense} from 'react';
import {Story, Meta} from '@storybook/react/types-6-0';
import {Slot, SlotProps} from './index';

export default {
    title: 'Components/Slot',
    component: Slot,
    decorators: [DecoratedStory => (
        <div className="card">
            <DecoratedStory />
        </div>
    )],
    parameters: {
        layout: 'centered',
        docs: {
            source: {
                type: 'code',
            },
        },
    },
} as Meta;

type HomeBannerProps = {
    loading?: true,
    title: string,
    subtitle: string,
    cta: {
        label: string,
        link: string,
    },
};

const defaultHomeBannerProps: HomeBannerProps = {
    title: 'Unlock the power of the personalization',
    subtitle: 'Dive into the world of one-to-one engagement.',
    cta: {
        label: 'Try now',
        link: 'https://croct.com',
    },
};

const HomeBanner: FunctionComponent<HomeBannerProps> = ({loading, title, subtitle, cta}): ReactElement => (
    <div className={`home-banner${loading ? ' loading' : ''}`}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <a href={cta.link} className="cta">{cta.label}</a>
    </div>
);

type HomeBannerSlotProps = SlotProps<HomeBannerProps>;

export const WithSuspense: Story<HomeBannerSlotProps> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <Slot {...args} id="home-banner">
            {(props: HomeBannerProps) => (<HomeBanner {...props} />)}
        </Slot>
    </Suspense>
);

WithSuspense.args = {
    cacheKey: 'suspense',
};

export const WithInitialState: Story<HomeBannerSlotProps> = args => (
    <Slot {...args} id="home-banner">
        {(props: HomeBannerProps) => (<HomeBanner {...props} />)}
    </Slot>
);

WithInitialState.args = {
    cacheKey: 'initial-state',
    initial: {
        loading: true,
        ...defaultHomeBannerProps,
    },
};

export const WithFallbackState: Story<HomeBannerSlotProps> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <Slot {...args} id={'wrong-banner-id' as 'home-banner'}>
            {(props: HomeBannerProps) => (<HomeBanner {...props} />)}
        </Slot>
    </Suspense>
);

WithFallbackState.args = {
    cacheKey: 'fallback-state',
    fallback: defaultHomeBannerProps,
};

