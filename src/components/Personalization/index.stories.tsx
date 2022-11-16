import {FunctionComponent, ReactElement, Suspense} from 'react';
import {Story, Meta} from '@storybook/react/types-6-0';
import {Personalization, PersonalizationProps} from './index';

export default {
    title: 'Components/Personalization',
    component: Personalization,
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

export const WithSuspense: Story<Omit<PersonalizationProps<string>, 'expression'>> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <Personalization {...args} expression="location's city">
            {(city: string): ReactElement => (
                <NewsWidget city={city} />
            )}
        </Personalization>
    </Suspense>
);

WithSuspense.args = {
    cacheKey: 'suspense',
};

export const WithInitialState: Story<Omit<PersonalizationProps<string, null>, 'expression'>> = args => (
    <Personalization {...args} expression="location's city">
        {(city: string|null): ReactElement => (
            <NewsWidget city={city} />
        )}
    </Personalization>
);

WithInitialState.args = {
    cacheKey: 'initial-state',
    initial: null,
};

export const WithFallbackState: Story<Omit<PersonalizationProps<string>, 'expression'>> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <Personalization {...args} expression="location's city">
            {(city: string): ReactElement => (
                <NewsWidget city={city} />
            )}
        </Personalization>
    </Suspense>
);

WithFallbackState.args = {
    cacheKey: 'fallback-state',
    fallback: 'your city',
    timeout: 1,
};
