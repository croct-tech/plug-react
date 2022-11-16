import {ContentFetcher} from '@croct/sdk/contentFetcher';
import {FetchResponse} from '@croct/plug/plug';
import {fetchContent, FetchOptions} from './fetchContent';

const mockFetch: ContentFetcher['fetch'] = jest.fn();

jest.mock(
    '@croct/sdk/ContentFetcher',
    () => ({
        __esModule: true,
        /*
     * eslint-disable-next-line prefer-arrow-callback --
     * The mock can't be an arrow function because calling new on
     * an arrow function is not allowed in JavaScript.
     */
        ContentFetcher: jest.fn(function constructor(this: ContentFetcher) {
            this.fetch = mockFetch;
        }),
    }),
);

describe('fetchContent', () => {
    const apiKey = '00000000-0000-0000-0000-000000000000';

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should forward the call to the content fetcher', async () => {
        const slotId = 'slot-id';

        const options: FetchOptions = {
            apiKey: apiKey,
            timeout: 100,
        };

        const result: FetchResponse<typeof slotId> = {
            content: {
                id: 'test',
            },
        };

        jest.mocked(mockFetch).mockResolvedValue(result);

        await expect(fetchContent(slotId, options)).resolves.toEqual(result);

        expect(ContentFetcher).toHaveBeenCalledWith({
            apiKey: options.apiKey,
        });

        expect(mockFetch).toHaveBeenCalledWith(slotId, {
            timeout: options.timeout,
        });
    });

    it('should return the fallback value on error', async () => {
        const slotId = 'slot-id';

        const fallback = {
            id: 'fallback',
        };

        const options: FetchOptions = {
            apiKey: apiKey,
            timeout: 100,
            fallback: fallback,
        };

        jest.mocked(mockFetch).mockRejectedValue(new Error('error'));

        await expect(fetchContent(slotId, options)).resolves.toEqual({
            content: fallback,
        });
    });
});
