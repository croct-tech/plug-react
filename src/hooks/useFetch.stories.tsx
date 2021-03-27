import {FunctionComponent, ReactElement, Suspense} from 'react';
import {Story, Meta} from '@storybook/react/types-6-0';
import {UseFetchOptions, useFetch} from './useFetch';

export default {
    title: 'Hooks/useFetch',
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

const HomeBanner: FunctionComponent<UseFetchOptions<HomeBannerProps>> = (options): ReactElement => {
    const {title, subtitle, cta} = useFetch<HomeBannerProps>('home-banner', options);

    return (
        <div className="home-banner">
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <a href={cta.link} className="cta">{cta.label}</a>
        </div>
    );
};

export const WithSuspense: Story<UseFetchOptions<HomeBannerProps>> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <HomeBanner {...args} />
    </Suspense>
);

WithSuspense.args = {
    cacheKey: 'suspense',
};

export const WithInitialState: Story<UseFetchOptions<HomeBannerProps>> = args => (
    <HomeBanner {...args} />
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
