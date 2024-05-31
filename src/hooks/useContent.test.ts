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
    type EvaluateScenario = {
        contextLocale?: string,
        contentLocale?: string,
        expectedLocale: string,
    };

    let testIndex = 0;

    it.each<[string, EvaluateScenario]>(Object.entries({
        'the context locale': {
            contextLocale: 'en',
            expectedLocale: 'en',
        },
        'the content locale': {
            contentLocale: 'pt-br',
            expectedLocale: 'pt-br',
        },
        'both the context and content locale': {
            contextLocale: 'en',
            contentLocale: 'pt-br',
            expectedLocale: 'pt-br',
        },
    }))('should evaluate the content providing %s', (_, options) => {
        const {contextLocale, contentLocale, expectedLocale} = options;

        const fetch: Plug['fetch'] = jest.fn().mockResolvedValue({
            payload: {
                title: 'loaded',
            },
        });

        jest.mocked(useCroct).mockReturnValue({
            plug: {fetch: fetch} as Plug,
            preferredLocale: contextLocale,
        });
        jest.mocked(useLoader).mockReturnValue('foo');

        const slotId = 'home-banner@1';

        const {result} = renderHook(
            () => useContent<{title: string}>(slotId, {
                preferredLocale: contentLocale,
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
            .calls[testIndex++][0]
            .loader();

        expect(fetch).toHaveBeenCalledWith(slotId, {
            preferredLocale: expectedLocale,
        });

        expect(result.current).toBe('foo');
    });
});
