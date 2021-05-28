import {renderHook} from '@testing-library/react-hooks/server';
import {useEvaluation} from './useEvaluation';

describe('useEvaluation (SSR)', () => {
    it('should render the initial value on the server-side', () => {
        const {result} = renderHook(() => useEvaluation('location', {initial: 'foo'}));

        expect(result.current).toBe('foo');
    });

    it('should require an initial value for server-side rending', () => {
        const {result} = renderHook(() => useEvaluation('location'));

        expect(result.error).toEqual(new Error('The initial value is required for server-side rendering (SSR).'));
    });
});
