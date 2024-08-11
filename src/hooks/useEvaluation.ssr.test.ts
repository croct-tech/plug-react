import {renderHook} from '@testing-library/react';
import {useEvaluation} from './useEvaluation';

jest.mock(
    '../ssr-polyfills',
    () => ({
        __esModule: true,
        isSsr: (): boolean => true,
    }),
);

describe('useEvaluation (SSR)', () => {
    it('should render the initial value on the server-side', () => {
        const {result} = renderHook(() => useEvaluation('location', {initial: 'foo'}));

        expect(result.current).toBe('foo');
    });

    it('should require an initial value for server-side rending', () => {
        expect(() => useEvaluation('location'))
            .toThrow('The initial value is required for server-side rendering (SSR).');
    });
});
