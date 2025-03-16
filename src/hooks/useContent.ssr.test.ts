import {renderHook} from '@testing-library/react';
import {getSlotContent} from '@croct/content';
import {useContent} from './useContent';

jest.mock(
    '../ssr-polyfills',
    () => ({
        __esModule: true,
        isSsr: (): boolean => true,
    }),
);

jest.mock(
    '@croct/content',
    () => ({
        __esModule: true,
        getSlotContent: jest.fn().mockReturnValue(null),
    }),
);

describe('useContent (SSR)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the initial value on the server-side', () => {
        const {result} = renderHook(() => useContent('slot-id', {initial: 'foo'}));

        expect(result.current).toBe('foo');
    });

    it('should require an initial value for server-side rending', () => {
        expect(() => useContent('slot-id'))
            .toThrow('The initial content is required for server-side rendering (SSR).');
    });

    it('should use the default content as initial value on the server-side', () => {
        const content = {foo: 'bar'};
        const slotId = 'slot-id';
        const preferredLocale = 'en';

        jest.mocked(getSlotContent).mockReturnValue(content);

        const {result} = renderHook(() => useContent(slotId, {preferredLocale: preferredLocale}));

        expect(getSlotContent).toHaveBeenCalledWith(slotId, preferredLocale);

        expect(result.current).toBe(content);
    });
});
