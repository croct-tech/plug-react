import {renderHook} from '@testing-library/react-hooks';
import croct, {Plug} from '@croct/plug';
import {useCroct} from './useCroct';
import {CroctContext, CroctProviderProps} from '../CroctProvider';

describe('useCroct', () => {
    it('should fail if used out of the <CroctProvider/> component', () => {
        jest.spyOn(console, 'error').mockImplementation();

        const {result} = renderHook<CroctProviderProps, Plug>(() => useCroct());

        // eslint-disable-next-line no-console
        expect(console.error).toHaveBeenCalled();

        expect(result.error?.message)
            .toBe('useCroct() can only be used in the context of a <CroctProvider> component.');
    });

    it('should return the Plug instance', () => {
        const {result} = renderHook<CroctProviderProps, Plug>(() => useCroct(), {
            wrapper: ({children}) => (
                <CroctContext.Provider value={{plug: croct}}>{children}</CroctContext.Provider>
            ),
        });

        expect(result.current).toBe(croct);
    });
});
