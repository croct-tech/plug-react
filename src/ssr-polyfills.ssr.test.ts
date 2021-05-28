import croct from '@croct/plug';
import {useEffect} from 'react';
import {croct as croctPolyfill, isSsr, useIsomorphicEffect} from './ssr-polyfills';

jest.mock('@croct/plug', () => ({
    plug: jest.fn(),
    unplug: jest.fn(),
}));

describe('Croct polyfill (SSR)', () => {
    it('should not plug', () => {
        croctPolyfill.plug({appId: '00000000-0000-0000-0000-000000000000'});

        expect(croct.plug).not.toHaveBeenCalled();
    });

    it('should not unplug', async () => {
        await expect(croctPolyfill.unplug()).resolves.toBeUndefined();

        expect(croct.unplug).not.toHaveBeenCalled();
    });

    it('should not allow accessing properties other than plug or unplug', () => {
        expect(() => croctPolyfill.user)
            .toThrow(
                'Property croct.user is not supported on server-side (SSR). Consider refactoring the logic '
                + 'as a side-effect (useEffect) or a client-side callback (onClick, onSubmit, etc).',
            );
    });
});

describe('isSsr', () => {
    it('should always return true', () => {
        expect(isSsr()).toBe(true);
    });
});

describe('useIsomorphicEffect', () => {
    it('should use the useEffect hook', () => {
        expect(useIsomorphicEffect).toBe(useEffect);
    });
});

