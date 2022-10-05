import {FunctionComponent} from 'react';
import {renderHook} from '@testing-library/react';
import croct, {Plug} from '@croct/plug';
import {useCroct} from './useCroct';
import {CroctContext, CroctProviderProps} from '../CroctProvider';

describe('useCroct', () => {
    it('should fail if used out of the <CroctProvider/> component', () => {
        jest.spyOn(console, 'error')
            .mockImplementation();

        // https://reactjs.org/docs/error-boundaries.html#how-about-trycatch
        try {
            renderHook<Plug, FunctionComponent<CroctProviderProps>>(() => useCroct());
        } catch (e: any) {
            expect(console.error)
                .toHaveBeenCalled();

            expect(e.message)
                .toBe('useCroct() can only be used in the context of a <CroctProvider> component.');
        }
    });

    it('should return the Plug instance', () => {
        const {result} = renderHook<Plug, FunctionComponent<CroctProviderProps>>(() => useCroct(), {
            wrapper: ({children}) => (
                <CroctContext.Provider value={{plug: croct}}>{children}</CroctContext.Provider>
            ),
        });

        expect(result.current)
            .toBe(croct);
    });
});
