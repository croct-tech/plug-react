import croct, {Configuration} from '@croct/plug';
import {croct as croctPolyfill, isSsr} from './ssr-polyfills';
import spyOn = jest.spyOn;

describe('Croct polyfill (CSR)', () => {
    beforeAll(() => {
        jest.clearAllMocks();
    });

    const config: Configuration = {appId: '00000000-0000-0000-0000-000000000000'};

    it('should delay unplugging to avoid reconnections', async () => {
        jest.useFakeTimers();

        const unplug = spyOn(croct, 'unplug');

        const plug = spyOn(croct, 'plug');

        croctPolyfill.plug(config);

        expect(plug).toHaveBeenCalledTimes(1);

        // First attempt: cancelling

        const firstAttempt = croctPolyfill.unplug();

        expect(unplug).not.toHaveBeenCalled();

        croctPolyfill.plug(config);

        jest.runOnlyPendingTimers();

        await expect(firstAttempt).rejects.toThrow('Unplug cancelled.');

        expect(unplug).not.toHaveBeenCalled();

        // Second attempt: failing

        unplug.mockRejectedValueOnce(new Error('Unplug failed.'));

        const secondAttempt = croct.unplug();

        jest.runOnlyPendingTimers();

        await expect(secondAttempt).rejects.toThrow('Unplug failed.');

        // Third attempt: succeeding

        unplug.mockResolvedValueOnce();

        const thirdAttempt = croct.unplug();

        jest.runOnlyPendingTimers();

        await expect(thirdAttempt).resolves.toBeUndefined();

        expect(unplug).toHaveBeenCalledTimes(2);
    });
});

describe('isSsr', () => {
    it('should always return false', () => {
        expect(isSsr()).toBe(false);
    });
});
