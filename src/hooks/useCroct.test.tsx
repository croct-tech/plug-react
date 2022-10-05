import {renderHook} from '@testing-library/react';
import croct, {Plug} from '@croct/plug';
import {useCroct} from './useCroct';
import {CroctContext, CroctProviderProps} from '../CroctProvider';

describe('useCroct', () => {
    it('should fail if used out of the <CroctProvider/> component', () => {
        jest.spyOn(console, 'error')
            .mockImplementation();

        expect(() => {
            renderHook<Plug, CroctProviderProps>(() => useCroct());
        })
            .toThrow('useCroct() can only be used in the context of a <CroctProvider> component.');

        // eslint-disable-next-line no-console
        expect(console.error)
            .toHaveBeenCalled();
    });

    it('should return the Plug instance', () => {
        const {result} = renderHook<Plug, CroctProviderProps>(() => useCroct(), {
            wrapper: ({children}) => (
                <CroctContext.Provider value={{plug: croct}}>{children}</CroctContext.Provider>
            ),
        });

        expect(result.current)
            .toBe(croct);
    });
});
