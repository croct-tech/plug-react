import {renderHook} from '@testing-library/react';
import {Plug} from '@croct/plug';
import {useCroct} from './useCroct';
import {useLoader} from './useLoader';
import {useContent} from './useContent';

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

describe('useContent (CSR)', () => {
    it('should evaluate fetch the content', () => {
        const fetch: Plug['fetch'] = jest.fn().mockResolvedValue({
            payload: {
                title: 'loaded',
            },
        });

        jest.mocked(useCroct).mockReturnValue({fetch: fetch} as Plug);
        jest.mocked(useLoader).mockReturnValue('foo');

        const slotId = 'home-banner';

        const {result} = renderHook(
            () => useContent<{title: string}>(slotId, {
                preferredLocale: 'en',
                cacheKey: 'unique',
                fallback: {
                    title: 'error',
                },
                expiration: 50,
            }),
        );

        expect(useCroct).toHaveBeenCalled();
        expect(useLoader).toHaveBeenCalledWith({
            cacheKey: `useContent:unique:${slotId}`,
            fallback: {
                title: 'error',
            },
            expiration: 50,
            loader: expect.any(Function),
        });

        jest.mocked(useLoader)
            .mock
            .calls[0][0]
            .loader();

        expect(fetch).toHaveBeenCalledWith(slotId, {
            preferredLocale: 'en',
        });

        expect(result.current).toBe('foo');
    });
});
