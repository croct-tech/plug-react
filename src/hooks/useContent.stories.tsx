import {FunctionComponent, ReactElement, Suspense} from 'react';
import {Story, Meta} from '@storybook/react/types-6-0';
import {UseContentOptions, useContent} from './useContent';

export default {
    title: 'Hooks/useContent',
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

type HeroOptions = UseContentOptions<HomeBannerProps, HomeBannerProps> & {
    slotId?: 'home-banner',
};

const PersonalizedHomeBanner: FunctionComponent<HeroOptions> = ({slotId = 'home-banner', ...options}): ReactElement => {
    const props = useContent<HomeBannerProps>(slotId, options);

    return (<HomeBanner {...props} />);
};

export const WithSuspense: Story<HeroOptions> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <PersonalizedHomeBanner {...args} />
    </Suspense>
);

WithSuspense.args = {
    cacheKey: 'suspense',
};

export const WithInitialState: Story<HeroOptions> = args => (
    <PersonalizedHomeBanner {...args} />
);

WithInitialState.args = {
    cacheKey: 'initial-state',
    initial: {
        loading: true,
        ...defaultHomeBannerProps,
    },
};

export const WithFallbackState: Story<HeroOptions> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <PersonalizedHomeBanner {...args} />
    </Suspense>
);

WithFallbackState.args = {
    cacheKey: 'default',
    slotId: 'wrong-slot-id' as 'home-banner',
    fallback: defaultHomeBannerProps,
};
