import {FunctionComponent, ReactElement, Suspense} from 'react';
import {Story, Meta} from '@storybook/react/types-6-0';
import {UseEvaluationOptions, useEvaluation} from './useEvaluation';

export default {
    title: 'Hooks/useEvaluation',
    decorators: [DecoratedStory => (
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

const NewsWidget: FunctionComponent<UseEvaluationOptions<string>> = (options): ReactElement => {
    const city = useEvaluation<string>('location\'s city', options);

    return (
        <div className="news-widget">
            <span className="badge">Case Study</span>
            <a href="https://croct.com">
                See how our customers from
                <span>{city}</span>
                to reach their business goals
            </a>
        </div>
    );
};

export const Default: Story<UseEvaluationOptions<string>> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <NewsWidget {...args} />
    </Suspense>
);

Default.args = {
    cacheKey: 'default',
};
