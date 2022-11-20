import {fetchContent as contentApi} from '@croct/plug-react/api';
import {headers as nextHeaders} from 'next/headers';
import {SlotContent} from '@croct/plug-react';
import {VersionedSlotId} from '@croct/plug/slot';
import {Header} from '@/lib/constants';
import {fetchContent, FetchOptions} from '@/lib/utils/fetchContent';

jest.mock(
    'server-only',
    () => ({__esModule: true}),
);

jest.mock(
    '@croct/plug-react/api',
    () => ({
        __esModule: true,
        fetchContent: jest.fn(),
    }),
);

jest.mock(
    'next/headers',
    () => ({headers: jest.fn()}),
);

describe('fetchContent', () => {
    const {env} = process;
    const slotId: VersionedSlotId = 'home-banner@1';
    const API_KEY = '00000000-0000-0000-0000-000000000000';
    const options: FetchOptions<SlotContent<typeof slotId>> = {
        timeout: 100,
        extra: {
            cache: 'no-store',
        },
    };
    const content: SlotContent<typeof slotId> = {
        title: 'Hello World',
        subtitle: 'This is a subtitle',
        cta: {
            label: 'Click me',
            link: 'https://example.com',
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

    it('should fetch content', async () => {
        const headers = new Headers();

        jest.mocked(contentApi).mockResolvedValue({content: content});
        jest.mocked(nextHeaders).mockReturnValue(headers as ReturnType<typeof nextHeaders>);

        await expect(fetchContent(slotId, options)).resolves.toBe(content);

        expect(contentApi).toHaveBeenCalledWith(slotId, {
            ...options,
            apiKey: API_KEY,
        });
    });

    it('should fetch content using the available information', async () => {
        const headers = new Headers();

        headers.set(Header.REQUEST_URI, 'https://example.com');
        headers.set(Header.REFERRER, 'https://referrer.com');
        headers.set(Header.CLIENT_ID, '00000000-0000-0000-0000-000000000001');
        headers.set(Header.CLIENT_IP, '127.0.0.1');
        headers.set(Header.USER_AGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');

        jest.mocked(contentApi).mockResolvedValue({content: content});
        jest.mocked(nextHeaders).mockReturnValue(headers as ReturnType<typeof nextHeaders>);

        await expect(fetchContent(slotId, options)).resolves.toBe(content);

        expect(contentApi).toHaveBeenCalledWith(slotId, {
            ...options,
            apiKey: API_KEY,
            clientId: headers.get(Header.CLIENT_ID),
            clientIp: headers.get(Header.CLIENT_IP),
            userAgent: headers.get(Header.USER_AGENT),
            context: {
                page: {
                    url: headers.get(Header.REQUEST_URI),
                    referrer: headers.get(Header.REFERRER),
                },
            },
        });
    });
});
