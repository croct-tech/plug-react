import {PropsWithChildren} from 'react';
import {renderHook} from '@testing-library/react';
import croct, {Plug} from '@croct/plug';
import {useCroct} from './useCroct';
import {CroctContext} from '../CroctProvider';

describe('useCroct', () => {
    it('should fail if used out of the <CroctProvider/> component', () => {
        jest.spyOn(console, 'error').mockImplementation();

        expect(
            () => {
                renderHook(() => useCroct());
            },
        ).toThrow(new Error('Hook useCroct() must be used within a <CroctProvider />.'));

        // eslint-disable-next-line no-console -- Needed to assert the call
        expect(console.error).toHaveBeenCalled();
    });

    it('should return the Plug instance', () => {
        const {result} = renderHook<Plug, PropsWithChildren>(
            () => useCroct(),
            {
                wrapper: ({children}) => (
                    <CroctContext.Provider value={{plug: croct}}>
                        {children}
                    </CroctContext.Provider>
                ),
            },
        );

        expect(result.current).toBe(croct);
    });
});
