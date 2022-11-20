import {act, render, screen, waitFor} from '@testing-library/react';
import {CroctProvider} from '@croct/plug-react';
import croct from '@croct/plug';
import {SlotContent} from '@croct/plug/slot';
import HomeBanner, {HomeBannerProps} from '@/components/HomeBanner';

function flushPromises(): Promise<void> {
    return Promise.resolve();
}

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

        const fetchContent = jest.spyOn(croct, 'fetch');

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

        expect(fetchContent).toHaveBeenCalledWith('home-banner@1', {});

        expect(screen.getByText('Experience up to 20% more revenue faster')).toBeInTheDocument();

        expect(screen.getByText('Deliver tailored experiences that drive satisfaction and growth.'))
            .toBeInTheDocument();

        expect(screen.getByText('Discover how')).toBeInTheDocument();

        await act(flushPromises);

        await waitFor(() => {
            expect(screen.getByText(content.title)).toBeInTheDocument();
        });
    });

    it('should render the fallback content on error', async () => {
        const fetchContent = jest.spyOn(croct, 'fetch');

        fetchContent.mockRejectedValue(new Error('failure'));

        render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <HomeBanner cacheKey="home-banner-fallback" defaultContent={defaultContent} />
            </CroctProvider>,
        );

        await act(flushPromises);

        expect(fetchContent).toHaveBeenCalledWith('home-banner@1', {});

        expect(screen.getByText('Experience up to 20% more revenue faster')).toBeInTheDocument();

        expect(screen.getByText('Deliver tailored experiences that drive satisfaction and growth.'))
            .toBeInTheDocument();

        expect(screen.getByText('Discover how')).toBeInTheDocument();
    });
});
