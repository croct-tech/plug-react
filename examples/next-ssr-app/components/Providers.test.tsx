import {render} from '@testing-library/react';
import {headers as nextHeaders} from 'next/headers';
import {CroctProvider} from '@croct/plug-react';
import {Header} from '@/lib/constants';
import Providers from '@/components/Providers';

jest.mock(
    '@croct/plug-react/CroctProvider',
    () => ({
        __esModule: true,
        CroctProvider: jest.fn(({children}) => children),
    }),
);

jest.mock(
    'next/headers',
    () => ({headers: jest.fn()}),
);

describe('<Providers />', () => {
    const {env} = process;
    const APP_ID = '00000000-0000-0000-0000-000000000000';

    beforeEach(() => {
        process.env = {
            ...env,
            NEXT_PUBLIC_CROCT_APP_ID: APP_ID,
        };
    });

    afterEach(() => {
        process.env = env;
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize the Croct provider', () => {
        const clientId = '00000000-0000-0000-0000-000000000001';

        const headers = new Headers();

        headers.set(Header.CLIENT_ID, clientId);

        jest.mocked(nextHeaders).mockReturnValue(headers as ReturnType<typeof nextHeaders>);

        render(<Providers>foo</Providers>);

        expect(CroctProvider).toHaveBeenLastCalledWith(
            {
                appId: APP_ID,
                clientId: clientId,
                children: 'foo',
            },
            expect.anything(),
        );
    });
});
