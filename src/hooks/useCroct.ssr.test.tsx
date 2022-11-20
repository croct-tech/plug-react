import {renderHook} from '@testing-library/react';
import {useCroct} from './useCroct';
import {CroctProvider} from '../CroctProvider';

jest.mock(
    '../ssr-polyfills',
    () => ({
        __esModule: true,
        ...jest.requireActual('../ssr-polyfills'),
        isSsr: (): boolean => true,
    }),
);

describe('useCroct', () => {
    it('should not fail on server-side rendering', () => {
        const {result} = renderHook(() => useCroct(), {
            wrapper: ({children}) => (
                <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                    {children}
                </CroctProvider>
            ),
        });

        expect(result).not.toBeUndefined();
    });
});
