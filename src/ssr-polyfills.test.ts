import {useLayoutEffect} from 'react';
import croct from '@croct/plug';
import {croct as croctPolyfill, isSsr, useIsomorphicEffect} from './ssr-polyfills';

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

describe('useIsomorphicEffect', () => {
    it('should use the useLayoutEffect hook', () => {
        expect(useIsomorphicEffect).toBe(useLayoutEffect);
    });
});

