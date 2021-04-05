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
    title: string,
    subtitle: string,
    cta: {
        label: string,
        link: string,
    },
};

const HomeBanner: FunctionComponent<HomeBannerProps> = ({title, subtitle, cta}): ReactElement => (
    <div className="home-banner">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <a href={cta.link} className="cta">{cta.label}</a>
    </div>
);

export const WithSuspense: Story<SlotProps<HomeBannerProps>> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <Slot {...args} id="home-banner">
            {(props: HomeBannerProps) => (<HomeBanner {...props} />)}
        </Slot>
    </Suspense>
);

WithSuspense.args = {
    cacheKey: 'suspense',
};

export const WithInitialState: Story<SlotProps<HomeBannerProps>> = args => (
    <Slot {...args} id="home-banner">
        {(props: HomeBannerProps) => (<HomeBanner {...props} />)}
    </Slot>
);

WithInitialState.args = {
    cacheKey: 'initial-state',
    initial: {
        title: 'Unlock the power of the personalization',
        subtitle: 'Dive into the world of one-to-one engagement.',
        cta: {
            label: 'Try now',
            link: 'https://croct.com',
        },
    },
};

export const WithFallbackState: Story<SlotProps<HomeBannerProps>> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <Slot {...args} id="wrong-banner-id">
            {(props: HomeBannerProps) => (<HomeBanner {...props} />)}
        </Slot>
    </Suspense>
);

WithFallbackState.args = {
    cacheKey: 'fallback-state',
    fallback: {
        title: 'Unlock the power of the personalization',
        subtitle: 'Dive into the world of one-to-one engagement.',
        cta: {
            label: 'Try now',
            link: 'https://croct.com',
        },
    },
};
