import {render, screen} from '@testing-library/react';
import {SlotContent} from '@croct/plug/slot';
import HomeBanner, {preloadHomeBanner} from '@/components/HomeBanner';
import {fetchContent} from '@/lib/utils/fetchContent';

jest.mock(
    '../lib/utils/fetchContent',
    () => ({
        __esModule: true,
        fetchContent: jest.fn(),
    }),
);

describe('<HomeBanner />', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const content: SlotContent<'home-banner'> = {
        title: 'Title',
        subtitle: 'Subtitle',
        cta: {
            label: 'Label',
            link: 'https://croct.link/demo',
        },
    };

    it('should render the personalized content on success', async () => {
        jest.mocked(fetchContent).mockResolvedValue(content);

        // Jest does not support async component rendering yet
        render(await HomeBanner());

        expect(fetchContent).toHaveBeenCalledWith('home-banner', {
            fallback: {
                title: 'Experience up to 20% more revenue faster',
                subtitle: 'Deliver tailored experiences that drive satisfaction and growth.',
                cta: {
                    label: 'Discover how',
                    link: 'https://croct.link/demo',
                },
            },
        });

        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
});

describe('preloadHomeBanner', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should preload the personalized content', () => {
        preloadHomeBanner();

        expect(fetchContent).toHaveBeenCalledWith('home-banner', {
            fallback: {
                title: 'Experience up to 20% more revenue faster',
                subtitle: 'Deliver tailored experiences that drive satisfaction and growth.',
                cta: {
                    label: 'Discover how',
                    link: 'https://croct.link/demo',
                },
            },
        });
    });
});
