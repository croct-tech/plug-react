import croct from '@croct/plug';
import {renderHook} from '@testing-library/react';
import {useCroct} from './useCroct';
import {CroctContext} from '../CroctProvider';

describe('useCroct', () => {
    it('should fail if used out of the <CroctProvider/> component', () => {
        expect(() => renderHook(() => useCroct()))
            .toThrow('useCroct() can only be used in the context of a <CroctProvider> component.');
    });

    it('should return the Plug instance', () => {
        const {result} = renderHook(() => useCroct(), {
            wrapper: ({children}) => (
                <CroctContext.Provider value={{plug: croct}}>{children}</CroctContext.Provider>
            ),
        });

        expect(result.current).toBe(croct);
    });
});
