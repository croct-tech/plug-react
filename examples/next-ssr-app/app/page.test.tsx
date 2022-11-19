import {render, screen} from '@testing-library/react';
import {CroctProvider} from '@croct/plug-react';
import {ReactElement} from 'react';
import {preloadHomeBanner} from '@/components/HomeBanner';
import {evaluate} from '@/lib/utils/evaluate';
import Page from './page';

jest.mock(
    'server-only',
    () => ({__esModule: true}),
);

jest.mock(
    '../components/HomeBanner',
    () => ({
        __esModule: true,
        default: (): ReactElement => <div>Home Banner</div>,
        preloadHomeBanner: jest.fn(),
    }),
);

jest.mock(
    '../lib/utils/evaluate',
    () => ({
        __esModule: true,
        evaluate: jest.fn(),
    }),
);

describe('<Page />', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should preload the banner and evaluate the persona', async () => {
        jest.mocked(evaluate).mockResolvedValue('developer');

        // Jest does not support async component rendering yet
        render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                {await Page()}
            </CroctProvider>,
        );

        expect(preloadHomeBanner).toHaveBeenCalled();

        expect(evaluate).toHaveBeenCalledWith('user\'s persona or else \'default\'', {
            fallback: 'default',
        });

        expect(screen.getByText('Home Banner')).toBeInTheDocument();
        expect(screen.getByDisplayValue('🦸‍♂ Developer')).toBeInTheDocument();
    });
});
