import {renderHook} from '@testing-library/react-hooks/server';
import {useContent} from './useContent';

describe('useCsrContent (SSR)', () => {
    it('should render the initial value on the server-side', () => {
        const {result} = renderHook(() => useContent('slot-id', {initial: 'foo'}));

        expect(result.current).toBe('foo');
    });

    it('should require an initial value for server-side rending', () => {
        const {result} = renderHook(() => useContent('slot-id'));

        expect(result.error).toEqual(new Error('The initial value is required for server-side rendering (SSR).'));
    });
});
