import {Cache, EntryOptions} from './Cache';

describe('Cache', () => {
    afterEach(() => {
        jest.clearAllTimers();
        jest.resetAllMocks();
    });

    it('should load and cache the value for the default cache time', async () => {
        jest.useFakeTimers();

        const cache = new Cache(10);

        const loader = jest.fn()
            .mockResolvedValueOnce('result1')
            .mockResolvedValueOnce('result2');

        const options: EntryOptions<string> = {
            cacheKey: 'key',
            loader: loader,
        };

        let promise: Promise<any>|undefined;

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise = result;
        }

        await expect(promise).resolves.toEqual('result1');

        expect(cache.load(options)).toEqual('result1');

        expect(loader).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(10);

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise = result;
        }

        await expect(promise).resolves.toEqual('result2');

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('should load the value once before expiration', async () => {
        jest.useFakeTimers();

        const cache = new Cache(10);

        const loader = jest.fn(
            () => new Promise<string>(resolve => {
                setTimeout(() => resolve('done'), 10);
            }),
        );

        const options: EntryOptions<string> = {
            cacheKey: 'key',
            loader: loader,
        };

        let promise1: Promise<any>|undefined;

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise1 = result;
        }

        let promise2: Promise<any>|undefined;

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise2 = result;
        }

        expect(promise1).toBe(promise2);

        jest.advanceTimersByTime(10);

        await expect(promise1).resolves.toEqual('done');
        await expect(promise2).resolves.toEqual('done');

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should load and cache the value for the specified time', async () => {
        jest.useFakeTimers();

        const cache = new Cache(10);

        const loader = jest.fn()
            .mockResolvedValueOnce('result1')
            .mockResolvedValueOnce('result2');

        const options: EntryOptions<string> = {
            cacheKey: 'key',
            loader: loader,
            expiration: 15,
        };

        let promise: Promise<any>|undefined;

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise = result;
        }

        await expect(promise).resolves.toEqual('result1');

        expect(cache.load(options)).toEqual('result1');

        expect(loader).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(15);

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise = result;
        }

        await expect(promise).resolves.toEqual('result2');

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('should load and cache the value for undetermined time', async () => {
        jest.useFakeTimers();

        const cache = new Cache(10);

        const loader = jest.fn()
            .mockResolvedValueOnce('result1')
            .mockResolvedValueOnce('result2');

        const options: EntryOptions<string> = {
            cacheKey: 'key',
            loader: loader,
            expiration: -1,
        };

        let promise: Promise<any>|undefined;

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise = result;
        }

        await expect(promise).resolves.toEqual('result1');

        jest.advanceTimersByTime(60_000);

        expect(cache.load(options)).toEqual('result1');

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should return the fallback value on error', async () => {
        const cache = new Cache(10);

        const loader = jest.fn().mockRejectedValue(new Error('failed'));
        const options: EntryOptions<string> = {
            cacheKey: 'key',
            loader: loader,
            fallback: 'fallback',
        };

        let promise: Promise<any>|undefined;

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise = result;
        }

        await expect(promise).resolves.toBeUndefined();

        expect(cache.load(options)).toEqual('fallback');

        // Should cache the result but not the fallback value
        expect(cache.load({...options, fallback: 'error'})).toEqual('error');

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should throw the error if no fallback is specified', async () => {
        const cache = new Cache(10);

        const error = new Error('failed');

        const loader = jest.fn().mockRejectedValue(error);
        const options: EntryOptions<string> = {
            cacheKey: 'key',
            loader: loader,
        };

        let promise: Promise<any>|undefined;

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise = result;
        }

        await expect(promise).resolves.toBeUndefined();

        await expect(() => cache.load(options)).toThrow(error);
    });

    it('should cache the error', async () => {
        const cache = new Cache(10);

        const error = new Error('error');
        const loader = jest.fn().mockRejectedValue(error);
        const options: EntryOptions<string> = {
            cacheKey: 'key',
            loader: loader,
        };

        let promise: Promise<any>|undefined;

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise = result;
        }

        await expect(promise).resolves.toBeUndefined();

        expect(() => cache.load(options)).toThrow(error);
        expect(cache.get(options.cacheKey)?.error).toBe(error);
    });

    it('should provide the cached values', async () => {
        jest.useFakeTimers();

        const cache = new Cache(10);

        const loader = jest.fn().mockResolvedValue('loaded');
        const options: EntryOptions<string> = {
            cacheKey: 'key',
            loader: loader,
        };

        let promise: Promise<any>|undefined;

        try {
            cache.load(options);
        } catch (result: any|undefined) {
            promise = result;
        }

        await promise;

        jest.advanceTimersByTime(9);

        const entry = cache.get(options.cacheKey);

        expect(entry?.result).toBe('loaded');
        expect(entry?.promise).toBe(promise);
        expect(entry?.timeout).not.toBeUndefined();
        expect(entry?.error).toBeUndefined();

        entry?.dispose();

        jest.advanceTimersByTime(9);

        expect(cache.get(options.cacheKey)).toBe(entry);

        expect(loader).toHaveBeenCalledTimes(1);
    });
});
