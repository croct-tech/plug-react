/*
 * @jest-environment node
 */
import croct from '@croct/plug';
import {croct as croctPolyfill, isSsr} from './ssr-polyfills';

jest.mock(
    '@croct/plug',
    () => ({
        plug: jest.fn(),
        unplug: jest.fn(),
    }),
);

describe('Croct polyfill (SSR)', () => {
    it('should not plug', () => {
        croctPolyfill.plug({appId: '00000000-0000-0000-0000-000000000000'});

        expect(croct.plug).not.toHaveBeenCalled();
    });

    it('should not unplug', async () => {
        await expect(croctPolyfill.unplug()).resolves.toBeUndefined();

        expect(croct.unplug).not.toHaveBeenCalled();
    });

    it('should not initialize', () => {
        expect(croctPolyfill.initialized).toBe(false);

        croctPolyfill.plug({appId: '00000000-0000-0000-0000-000000000000'});

        expect(croctPolyfill.initialized).toBe(false);
    });

    it('should not allow accessing properties other than plug or unplug', () => {
        expect(() => croctPolyfill.user)
            .toThrow('Property croct.user is not supported on server-side (SSR).');
    });
});

describe('isSsr', () => {
    it('should always return true', () => {
        expect(isSsr()).toBe(true);
    });
});
