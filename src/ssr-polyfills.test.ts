import croct from '@croct/plug';
import {croct as croctPolyfill, isSsr} from './ssr-polyfills';

describe('Croct polyfill', () => {
    it('should use the global plug', () => {
        expect(croctPolyfill).toBe(croct);
    });
});

describe('isSsr', () => {
    it('should always return false', () => {
        expect(isSsr()).toBe(false);
    });
});
