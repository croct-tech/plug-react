import {renderHook} from '@testing-library/react';
import {useContent} from './useContent';

jest.mock(
    '../ssr-polyfills',
    () => ({
        __esModule: true,
        isSsr: (): boolean => true,
    }),
);

describe('useContent (SSR)', () => {
    it('should render the initial value on the server-side', () => {
        const {result} = renderHook(() => useContent('slot-id', {initial: 'foo'}));

        expect(result.current).toBe('foo');
    });

    it('should require an initial value for server-side rending', () => {
        expect(() => useContent('slot-id'))
            .toThrow('The initial content is required for server-side rendering (SSR).');
    });
});
