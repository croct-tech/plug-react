import {renderHook, waitFor} from '@testing-library/react';
import {getSlotContent} from '@croct/content';
import {Plug} from '@croct/plug';
import {useCroct} from './useCroct';
import {useLoader} from './useLoader';
import {useContent} from './useContent';
import {hash} from '../hash';

jest.mock(
    './useCroct',
    () => ({
        useCroct: jest.fn(),
    }),
);

jest.mock(
    './useLoader',
    () => ({
        useLoader: jest.fn(),
    }),
);

jest.mock(
    '@croct/content',
    () => ({
        __esModule: true,
        getSlotContent: jest.fn().mockReturnValue(null),
    }),
);

describe('useContent (CSR)', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should fetch the content', () => {
        const fetch: Plug['fetch'] = jest.fn().mockResolvedValue({
            content: {},
        });

        jest.mocked(useCroct).mockReturnValue({fetch: fetch} as Plug);
        jest.mocked(useLoader).mockReturnValue({
            title: 'foo',
        });

        const slotId = 'home-banner@1';
        const preferredLocale = 'en';
        const attributes = {example: 'value'};
        const cacheKey = 'unique';

        const {result} = renderHook(
            () => useContent<{title: string}>(slotId, {
                preferredLocale: preferredLocale,
                attributes: attributes,
                cacheKey: cacheKey,
                fallback: {
                    title: 'error',
                },
                expiration: 50,
            }),
        );

        expect(useCroct).toHaveBeenCalled();
        expect(useLoader).toHaveBeenCalledWith({
            cacheKey: hash(`useContent:${cacheKey}:${slotId}:${preferredLocale}:${JSON.stringify(attributes)}`),
            expiration: 50,
            loader: expect.any(Function),
        });

        jest.mocked(useLoader)
            .mock
            .calls[0][0]
            .loader();

        expect(fetch).toHaveBeenCalledWith(slotId, {
            fallback: {title: 'error'},
            preferredLocale: 'en',
            attributes: attributes,
        });

        expect(result.current).toEqual({title: 'foo'});
    });

    it('should use the initial value when the cache key changes if the stale-while-loading flag is false', async () => {
        const key = {
            current: 'initial',
        };

        const fetch: Plug['fetch'] = jest.fn().mockResolvedValue({content: {}});

        jest.mocked(useCroct).mockReturnValue({fetch: fetch} as Plug);

        jest.mocked(useLoader).mockImplementation(
            () => ({title: key.current === 'initial' ? 'first' : 'second'}),
        );

        const slotId = 'home-banner@1';

        const {result, rerender} = renderHook(
            () => useContent<{title: string}>(slotId, {
                cacheKey: key.current,
                initial: {
                    title: 'initial',
                },
            }),
        );

        expect(useCroct).toHaveBeenCalled();

        expect(useLoader).toHaveBeenCalledWith(expect.objectContaining({
            cacheKey: hash(`useContent:${key.current}:${slotId}::${JSON.stringify({})}`),
            initial: {
                title: 'initial',
            },
        }));

        await waitFor(() => expect(result.current).toEqual({title: 'first'}));

        key.current = 'next';

        rerender();

        expect(useLoader).toHaveBeenCalledWith(expect.objectContaining({
            cacheKey: hash(`useContent:${key.current}:${slotId}::${JSON.stringify({})}`),
            initial: {
                title: 'initial',
            },
        }));

        await waitFor(() => expect(result.current).toEqual({title: 'second'}));
    });

    it('should use the last fetched content as initial value if the stale-while-loading flag is true', async () => {
        const key = {
            current: 'initial',
        };

        const fetch: Plug['fetch'] = jest.fn().mockResolvedValue({content: {}});

        jest.mocked(useCroct).mockReturnValue({fetch: fetch} as Plug);

        const firstResult = {
            title: 'first',
        };

        const secondResult = {
            title: 'second',
        };

        jest.mocked(useLoader).mockImplementation(
            () => (key.current === 'initial' ? firstResult : secondResult),
        );

        const slotId = 'home-banner@1';

        const {result, rerender} = renderHook(
            () => useContent<{title: string}>(slotId, {
                cacheKey: key.current,
                initial: {
                    title: 'initial',
                },
                staleWhileLoading: true,
            }),
        );

        expect(useCroct).toHaveBeenCalled();

        expect(useLoader).toHaveBeenCalledWith(expect.objectContaining({
            cacheKey: hash(`useContent:${key.current}:${slotId}::${JSON.stringify({})}`),
            initial: {
                title: 'initial',
            },
        }));

        await waitFor(() => expect(result.current).toEqual({title: 'first'}));

        key.current = 'next';

        rerender();

        expect(useLoader).toHaveBeenCalledWith(expect.objectContaining({
            cacheKey: hash(`useContent:${key.current}:${slotId}::${JSON.stringify({})}`),
            initial: {
                title: 'first',
            },
        }));

        await waitFor(() => expect(result.current).toEqual({title: 'second'}));
    });

    it('should use the default content as initial value if not provided', () => {
        const content = {foo: 'bar'};
        const slotId = 'slot-id';
        const preferredLocale = 'en';

        jest.mocked(getSlotContent).mockReturnValue(content);

        renderHook(() => useContent(slotId, {preferredLocale: preferredLocale}));

        expect(getSlotContent).toHaveBeenCalledWith(slotId, preferredLocale);

        expect(useLoader).toHaveBeenCalledWith(
            expect.objectContaining({
                initial: content,
            }),
        );
    });

    it('should use the provided initial value', () => {
        const initial = null;
        const slotId = 'slot-id';
        const preferredLocale = 'en';

        jest.mocked(getSlotContent).mockReturnValue(null);

        renderHook(
            () => useContent(slotId, {
                preferredLocale: preferredLocale,
                initial: initial,
            }),
        );

        expect(useLoader).toHaveBeenCalledWith(
            expect.objectContaining({
                initial: initial,
            }),
        );
    });

    it('should use the default content as fallback value if not provided', () => {
        const content = {foo: 'bar'};
        const slotId = 'slot-id';
        const preferredLocale = 'en';

        const fetch: Plug['fetch'] = jest.fn().mockResolvedValue({
            content: {},
        });

        jest.mocked(useCroct).mockReturnValue({fetch: fetch} as Plug);

        jest.mocked(getSlotContent).mockReturnValue(content);

        renderHook(
            () => useContent(slotId, {
                preferredLocale: preferredLocale,
                fallback: content,
            }),
        );

        expect(getSlotContent).toHaveBeenCalledWith(slotId, preferredLocale);

        jest.mocked(useLoader)
            .mock
            .calls[0][0]
            .loader();

        expect(fetch).toHaveBeenCalledWith(slotId, {
            fallback: content,
            preferredLocale: preferredLocale,
        });
    });

    it('should use the provided fallback value', () => {
        const fallback = null;
        const slotId = 'slot-id';
        const preferredLocale = 'en';

        const fetch: Plug['fetch'] = jest.fn().mockResolvedValue({
            content: {},
        });

        jest.mocked(useCroct).mockReturnValue({fetch: fetch} as Plug);

        jest.mocked(getSlotContent).mockReturnValue(null);

        renderHook(
            () => useContent(slotId, {
                preferredLocale: preferredLocale,
                fallback: fallback,
            }),
        );

        jest.mocked(useLoader)
            .mock
            .calls[0][0]
            .loader();

        expect(fetch).toHaveBeenCalledWith(slotId, {
            fallback: fallback,
            preferredLocale: preferredLocale,
        });
    });

    it('should normalize an empty preferred locale to undefined', () => {
        const fetch: Plug['fetch'] = jest.fn().mockResolvedValue({
            content: {},
        });

        jest.mocked(useCroct).mockReturnValue({fetch: fetch} as Plug);

        renderHook(
            () => useContent('slot-id', {
                preferredLocale: '',
            }),
        );

        jest.mocked(useLoader)
            .mock
            .calls[0][0]
            .loader();

        expect(jest.mocked(fetch).mock.calls[0][1]).toStrictEqual({});
    });
});
