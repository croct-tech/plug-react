import {evaluate as evaluationApi} from '@croct/plug-react/api';
import {headers as nextHeaders} from 'next/headers';
import {evaluate, EvaluationOptions} from '@/lib/utils/evaluate';
import {Header} from '@/lib/constants';

jest.mock(
    'server-only',
    () => ({__esModule: true}),
);

jest.mock(
    '@croct/plug-react/api',
    () => ({
        __esModule: true,
        evaluate: jest.fn(),
    }),
);

jest.mock(
    'next/headers',
    () => ({headers: jest.fn()}),
);

describe('evaluate', () => {
    const {env} = process;
    const API_KEY = '00000000-0000-0000-0000-000000000000';
    const options: EvaluationOptions = {
        timeout: 100,
        extra: {
            cache: 'no-store',
        },
    };

    beforeEach(() => {
        process.env = {
            ...env,
            CROCT_API_KEY: API_KEY,
        };
    });

    afterEach(() => {
        process.env = env;
        jest.clearAllMocks();
    });

    it('should evaluate the query', async () => {
        const headers = new Headers();

        jest.mocked(evaluationApi).mockResolvedValue(true);
        jest.mocked(nextHeaders).mockReturnValue(headers as ReturnType<typeof nextHeaders>);

        await expect(evaluate('true', options)).resolves.toBe(true);

        expect(evaluationApi).toHaveBeenCalledWith('true', {
            ...options,
            apiKey: API_KEY,
        });
    });

    it('should evaluate the query using the available information', async () => {
        const headers = new Headers();

        headers.set(Header.REQUEST_URI, 'https://example.com');
        headers.set(Header.REFERRER, 'https://referrer.com');
        headers.set(Header.CLIENT_ID, '00000000-0000-0000-0000-000000000001');
        headers.set(Header.CLIENT_IP, '127.0.0.1');
        headers.set(Header.USER_AGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');

        jest.mocked(evaluationApi).mockResolvedValue(true);
        jest.mocked(nextHeaders).mockReturnValue(headers as ReturnType<typeof nextHeaders>);

        await expect(evaluate('true', options)).resolves.toBe(true);

        expect(evaluationApi).toHaveBeenCalledWith('true', {
            ...options,
            apiKey: API_KEY,
            clientId: headers.get(Header.CLIENT_ID),
            clientIp: headers.get(Header.CLIENT_IP),
            clientAgent: headers.get(Header.USER_AGENT),
            context: {
                page: {
                    url: headers.get(Header.REQUEST_URI),
                    referrer: headers.get(Header.REFERRER),
                },
            },
        });
    });
});
