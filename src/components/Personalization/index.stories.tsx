import {Suspense, FunctionComponent, ReactElement} from 'react';
import {Story, Meta} from '@storybook/react/types-6-0';
import {Personalization, PersonalizationProps} from './index';

export default {
    title: 'Components/Personalization',
    component: Personalization,
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

type NewsWidgetProps = {
    link: string,
};

const NewsWidget: FunctionComponent<NewsWidgetProps> = ({link, children}): ReactElement => (
    <div className="news-widget">
        <span className="badge">Case Study</span>
        <a href={link}>{children}</a>
    </div>
);

export const Default: Story<Omit<PersonalizationProps<string>, 'expression'>> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <Personalization {...args} expression="location's city">
            {(city: string) => (
                <NewsWidget link="https://croct.com">
                    See how our customers from
                    <span>{city}</span>
                    to reach their business goals
                </NewsWidget>
            )}
        </Personalization>
    </Suspense>
);

Default.args = {
    cacheKey: 'default',
};

export const WithFallbackState: Story<Omit<PersonalizationProps<string>, 'expression'>> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <Personalization {...args} expression="location's city">
            {(city: string) => (
                <NewsWidget link="https://croct.com">
                    See how our customers from
                    <span>{city}</span>
                    to reach their business goals
                </NewsWidget>
            )}
        </Personalization>
    </Suspense>
);

WithFallbackState.args = {
    cacheKey: 'fallback-state',
    fallback: 'your city',
    timeout: 1,
};
