import {renderHook} from '@testing-library/react-hooks';
import {useCroct} from './useCroct';
import {useSuspense} from './useSuspense';
import {useContent} from './useContent';

jest.mock('./useCroct', () => ({
    useCroct: jest.fn(),
}));

jest.mock('./useSuspense', () => ({
    useSuspense: jest.fn(),
}));

describe('useContent', () => {
    it('should evaluate an expression', () => {
        const fetch = jest.fn().mockResolvedValue({
            payload: {
                title: 'loaded',
            },
        });

        (useCroct as jest.Mock).mockReturnValue({fetch: fetch});
        (useSuspense as jest.Mock).mockReturnValue('foo');

        const slotId = 'home-banner';

        const {result} = renderHook(() => useContent<{title: string}>(slotId, {
            cacheKey: 'unique',
            initial: {
                title: 'loading',
            },
            fallback: {
                title: 'error',
            },
            expiration: 50,
        }));

        expect(useCroct).toBeCalled();
        expect(useSuspense).toBeCalledWith({
            cacheKey: 'useContent:unique:home-banner',
            initial: {
                title: 'loading',
            },
            fallback: {
                title: 'error',
            },
            expiration: 50,
            loader: expect.any(Function),
        });

        (useSuspense as jest.Mock).mock.calls[0][0].loader();

        expect(fetch).toBeCalledWith(slotId);

        expect(result.current).toBe('foo');
    });
});
