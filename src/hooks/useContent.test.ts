import {renderHook} from '@testing-library/react';
import {useCroct} from './useCroct';
import {useLoader} from './useLoader';
import {useContent} from './useContent';

jest.mock('./useCroct', () => ({
    useCroct: jest.fn(),
}));

jest.mock('./useLoader', () => ({
    useLoader: jest.fn(),
}));

describe('useContent (CSR)', () => {
    it('should evaluate an expression', () => {
        const fetch = jest.fn().mockResolvedValue({
            payload: {
                title: 'loaded',
            },
        });

        (useCroct as jest.Mock).mockReturnValue({fetch: fetch});
        (useLoader as jest.Mock).mockReturnValue('foo');

        const slotId = 'home-banner';

        const {result} = renderHook(() => useContent<{title: string}>(slotId, {
            cacheKey: 'unique',
            fallback: {
                title: 'error',
            },
            expiration: 50,
        }));

        expect(useCroct).toHaveBeenCalled();
        expect(useLoader).toHaveBeenCalledWith({
            cacheKey: 'useContent:unique:home-banner',
            fallback: {
                title: 'error',
            },
            expiration: 50,
            loader: expect.any(Function),
        });

        (useLoader as jest.Mock).mock.calls[0][0].loader();

        expect(fetch).toHaveBeenCalledWith(slotId);

        expect(result.current).toBe('foo');
    });
});
