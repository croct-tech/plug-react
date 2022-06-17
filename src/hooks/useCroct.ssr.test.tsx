import {renderHook} from '@testing-library/react-hooks/server';
import {ReactNode} from 'react';
import {Plug} from '@croct/plug';
import {useCroct} from './useCroct';
import {CroctProvider} from '../CroctProvider';

type RenderHookProps = {
    children: ReactNode,
};

describe('useCroct', () => {
    it('should not fail on server-side rendering', () => {
        const {result} = renderHook<RenderHookProps, Plug>(() => useCroct(), {
            wrapper: ({children}) => (
                <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                    {children}
                </CroctProvider>
            ),
        });

        expect(result.error).toBeUndefined();
    });
});
