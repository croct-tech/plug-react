import {render} from '@testing-library/react';
import croct, {Plug} from '@croct/plug';
import {GlobalCroct} from '@/components/GlobalCroct';

declare global {
    interface Window {
        croct?: Plug;
    }
}

describe('<Providers />', () => {
    it('should expose the Croct instance on the global scope', () => {
        expect(window.croct).toBeUndefined();

        render(<GlobalCroct />);

        expect(window.croct).toBe(croct);
    });
});
