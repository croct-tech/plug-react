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
    title: string,
    subtitle: string,
    cta: {
        label: string,
        link: string,
    },
};

const HomeBanner: FunctionComponent<UseContentOptions<HomeBannerProps>> = (options): ReactElement => {
    const {title, subtitle, cta} = useContent<HomeBannerProps>('home-banner', options);

    return (
        <div className="home-banner">
            <h1>{title}</h1>
            <p>{subtitle}</p>
            <a href={cta.link} className="cta">{cta.label}</a>
        </div>
    );
};

export const Default: Story<UseContentOptions<HomeBannerProps>> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <HomeBanner {...args} />
    </Suspense>
);

Default.args = {
    cacheKey: 'default',
};
