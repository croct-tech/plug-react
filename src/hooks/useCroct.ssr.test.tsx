import {renderHook} from '@testing-library/react-hooks/server';
import {Plug} from '@croct/plug';
import {useCroct} from './useCroct';
import {CroctProvider, CroctProviderProps} from '../CroctProvider';

describe('useCroct', () => {
    it('should not fail on server-side rendering', () => {
        const {result} = renderHook<CroctProviderProps, Plug>(() => useCroct(), {
            wrapper: ({children}) => (
                <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                    {children}
                </CroctProvider>
            ),
        });

        expect(result.error).toBeUndefined();
    });
});
