import croct from '@croct/plug';
import {renderHook} from '@testing-library/react';
import {useCroct} from './useCroct';
import {CroctContext} from '../CroctProvider';

describe('useCroct', () => {
    it('should fail if used out of the <CroctProvider/> component', () => {
        jest.spyOn(console, 'error').mockImplementation();

        expect(() => renderHook(() => useCroct()))
            .toThrow(new Error('useCroct() can only be used in the context of a <CroctProvider> component.'));

        // eslint-disable-next-line no-console -- Testing console output.
        expect(console.error).toHaveBeenCalled();
    });

    it('should return the croct state', () => {
        const preferredLocale = 'en-us';

        const {result} = renderHook(() => useCroct(), {
            wrapper: ({children}) => (
                <CroctContext.Provider value={{plug: croct, preferredLocale: preferredLocale}}>
                    {children}
                </CroctContext.Provider>
            ),
        });

        expect(result.current.plug).toBe(croct);

        expect(result.current.preferredLocale).toBe(preferredLocale);
    });
});
