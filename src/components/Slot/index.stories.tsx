import {FunctionComponent, ReactElement, Suspense} from 'react';
import {Story, Meta} from '@storybook/react/types-6-0';
import {SlotContent} from '@croct/plug/fetch';
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

type BannerSlotProps = SlotProps<{loading?: boolean}, 'home-banner'>;
type BannerProps = SlotContent<'home-banner'> & {loading?: boolean};

const defaultProps: BannerProps = {
    title: 'Unlock the power of the personalization',
    subtitle: 'Dive into the world of one-to-one engagement.',
    cta: {
        label: 'Try now',
        link: 'https://croct.com',
    },
};

const HomeBanner: FunctionComponent<BannerProps> = ({loading, title, subtitle, cta}): ReactElement => (
    <div className={`home-banner${loading ? ' loading' : ''}`}>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <a href={cta.link} className="cta">{cta.label}</a>
    </div>
);

export const WithSuspense: Story<BannerSlotProps> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <Slot {...args} id="home-banner">
            {(props: BannerProps) => (<HomeBanner {...props} />)}
        </Slot>
    </Suspense>
);

WithSuspense.args = {
    cacheKey: 'suspense',
};

export const WithInitialState: Story<BannerSlotProps> = args => (
    <Slot {...args} id="home-banner">
        {(props: BannerProps) => (<HomeBanner {...props} />)}
    </Slot>
);

WithInitialState.args = {
    cacheKey: 'initial-state',
    initial: {
        loading: true,
        ...defaultProps,
    },
};

export const WithFallbackState: Story<BannerSlotProps> = args => (
    <Suspense fallback="✨ Personalizing content...">
        <Slot {...args} id="wrong-banner-id">
            {(props: BannerProps) => (<HomeBanner {...props} />)}
        </Slot>
    </Suspense>
);

WithFallbackState.args = {
    cacheKey: 'fallback-state',
    fallback: defaultProps,
};

