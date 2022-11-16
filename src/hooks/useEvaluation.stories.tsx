import {FunctionComponent, ReactElement, Suspense} from 'react';
import {Story, Meta} from '@storybook/react/types-6-0';
import {UseEvaluationOptions, useEvaluation} from './useEvaluation';

export default {
    title: 'Hooks/useEvaluation',
    decorators: [(DecoratedStory): ReactElement => (
        <div className="widget">
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

type NewsWidgetProps = {
    city: string|null,
};

const NewsWidget: FunctionComponent<NewsWidgetProps> = ({city}): ReactElement => (
    <div className={`news-widget ${city === null ? ' loading' : ''}`}>
        <span className="badge">Case Study</span>
        <a href="https://croct.com">
            See how our customers from
            <span>{city ?? 'your city'}</span>
            to reach their business goals
        </a>
    </div>
);

type PersonalizedNewsWidgetProps = UseEvaluationOptions<string|null, string>;

const PersonalizedNewsWidget: FunctionComponent<PersonalizedNewsWidgetProps> = (options): ReactElement => {
    const city = useEvaluation<string, string|null, string|null>('location\'s city', options);

    return (<NewsWidget city={city} />);
};

export const WithSuspense: Story<PersonalizedNewsWidgetProps> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <PersonalizedNewsWidget {...args} />
    </Suspense>
);

WithSuspense.args = {
    cacheKey: 'suspense',
};

export const WithInitialState: Story<PersonalizedNewsWidgetProps> = args => (
    <PersonalizedNewsWidget {...args} />
);

WithInitialState.args = {
    cacheKey: 'initial-state',
    initial: null,
};

export const WithFallbackState: Story<PersonalizedNewsWidgetProps> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <PersonalizedNewsWidget {...args} />
    </Suspense>
);

WithFallbackState.args = {
    cacheKey: 'fallback-state',
    fallback: 'your city',
    timeout: 1,
};
