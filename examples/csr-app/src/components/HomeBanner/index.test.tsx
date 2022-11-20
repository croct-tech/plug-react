import {act, render, screen, waitFor} from '@testing-library/react';
import {CroctProvider, SlotContent} from '@croct/plug-react';
import croct from '@croct/plug';
import HomeBanner from './index';
import '@testing-library/jest-dom';

function flushPromises(): Promise<void> {
    return Promise.resolve();
}

describe('<HomeBanner />', () => {
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
                <HomeBanner cacheKey="home-banner-success" />
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
        const fetchContent = jest.mocked(croct.fetch);

        fetchContent.mockRejectedValue(new Error('failure'));

        render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <HomeBanner cacheKey="home-banner-fallback" />
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
