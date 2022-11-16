import {render, screen, waitFor} from '@testing-library/react';
import {CroctProvider} from '@croct/plug-react';
import croct from '@croct/plug';
import {SlotContent} from '@croct/plug/slot';
import HomeBanner, {HomeBannerProps} from '@/components/HomeBanner';

jest.mock(
    '@croct/plug',
    () => ({
        __esModule: true,
        default: {
            fetch: jest.fn(),
        },
    }),
);

describe('<HomeBanner />', () => {
    const defaultContent: HomeBannerProps['defaultContent'] = {
        title: 'Experience up to 20% more revenue faster',
        subtitle: 'Deliver tailored experiences that drive satisfaction and growth.',
        cta: {
            label: 'Discover how',
            link: 'https://croct.link/demo',
        },
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the personalized content on success', async () => {
        const content: SlotContent<'home-banner'> = {
            title: 'Banner title',
            subtitle: 'Banner subtitle',
            cta: {
                label: 'Button',
                link: 'https://croct.com',
            },
        };

        const fetchContent = jest.mocked(croct.fetch);

        fetchContent.mockResolvedValue({
            content: content,
            // @todo: Remove after deprecation
            payload: content,
        });

        render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <HomeBanner cacheKey="home-banner-success" defaultContent={defaultContent} />
            </CroctProvider>,
        );

        expect(fetchContent).toHaveBeenCalledWith('home-banner');

        expect(screen.getByText('Experience up to 20% more revenue faster')).toBeInTheDocument();

        expect(screen.getByText('Deliver tailored experiences that drive satisfaction and growth.'))
            .toBeInTheDocument();

        expect(screen.getByText('Discover how')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(content.title)).toBeInTheDocument();
        });
    });

    it('should render the fallback content on error', () => {
        const fetchContent = jest.mocked(croct.fetch);

        fetchContent.mockRejectedValue(new Error('failure'));

        render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <HomeBanner cacheKey="home-banner-fallback" defaultContent={defaultContent} />
            </CroctProvider>,
        );

        expect(fetchContent).toHaveBeenCalledWith('home-banner');

        expect(screen.getByText('Experience up to 20% more revenue faster')).toBeInTheDocument();

        expect(screen.getByText('Deliver tailored experiences that drive satisfaction and growth.'))
            .toBeInTheDocument();

        expect(screen.getByText('Discover how')).toBeInTheDocument();
    });
});
