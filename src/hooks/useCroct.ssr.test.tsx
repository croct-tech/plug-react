import {renderHook} from '@testing-library/react-hooks/server';
import {ReactNode} from 'react';
import {useCroct} from './useCroct';
import {CroctProvider} from '../CroctProvider';

describe('useCroct', () => {
    it('should not fail on server-side rendering', () => {
        const {result} = renderHook(() => useCroct(), {
            wrapper: ({children}: {children?: ReactNode}) => (
                <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                    {children}
                </CroctProvider>
            ),
        });

        expect(result.error).toBeUndefined();
    });
});
