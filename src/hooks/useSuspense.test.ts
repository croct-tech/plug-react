import {renderHook} from '@testing-library/react-hooks';
import {useSuspense} from './useSuspense';

describe('useSuspense', () => {
    const cacheKey = {
        index: 0,
        next: function next() {
            this.index++;

            return this.current();
        },
        current: function current() {
            return `key-${this.index}`;
        },
    };

    beforeEach(() => {
        cacheKey.next();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // Needed to use fake timers and promises:
    // https://github.com/testing-library/react-testing-library/issues/244#issuecomment-449461804
    function flushPromises(): Promise<void> {
        return new Promise(resolve => setImmediate(resolve));
    }

    it('should return the load the value and cache on success', async () => {
        const loader = jest.fn().mockResolvedValue('foo');

        const {result, waitForNextUpdate, rerender} = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            loader: loader,
        }));

        rerender();

        await waitForNextUpdate();

        expect(result.current).toBe('foo');

        expect(loader).toBeCalledTimes(1);
    });

    it('should return the load the value and cache on error', async () => {
        const error = new Error('fail');
        const loader = jest.fn().mockRejectedValue(error);

        const {result, waitForNextUpdate, rerender} = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            loader: loader,
        }));

        rerender();

        await waitForNextUpdate();

        expect(result.error).toBe(error);

        expect(loader).toBeCalledTimes(1);
    });

    it('should return the fallback state on error', async () => {
        const loader = jest.fn().mockRejectedValue(new Error('fail'));

        const {result, waitForNextUpdate} = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            fallback: 'foo',
            loader: loader,
        }));

        await waitForNextUpdate();

        expect(result.current).toBe('foo');

        expect(loader).toBeCalled();
    });

    it('should extend the cache expiration on every render', async () => {
        jest.useFakeTimers();

        const loader = jest.fn().mockResolvedValue('foo');

        const {waitForNextUpdate, rerender} = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            loader: loader,
            expiration: 15,
        }));

        await flushPromises();

        await waitForNextUpdate();

        jest.advanceTimersByTime(14);

        rerender();

        jest.advanceTimersByTime(14);

        rerender();

        expect(loader).toBeCalledTimes(1);

        jest.advanceTimersByTime(15);

        rerender();

        expect(loader).toBeCalledTimes(2);
    });

    it('should not expire the cache when the expiration is negative', async () => {
        jest.useFakeTimers();

        const loader = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('foo'), 10)));

        const {waitForNextUpdate, rerender} = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            loader: loader,
            expiration: -1,
        }));

        jest.advanceTimersByTime(10);

        await flushPromises();

        await waitForNextUpdate();

        // First rerender
        rerender();

        // Second rerender
        rerender();

        expect(loader).toBeCalledTimes(1);
    });

    test.each<[number, number|undefined]>(
        [
            // [Expected elapsed time, Expiration]
            [60_000, undefined],
            [15_000, 15_000],
        ],
    )('should cache the values for %d milliseconds', async (step, expiration) => {
        jest.useFakeTimers();

        const delay = 10;
        const loader = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('foo'), delay)));

        const firstTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            expiration: expiration,
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await flushPromises();

        await firstTime.waitForNextUpdate();

        expect(firstTime.result.current).toBe('foo');

        const secondTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            expiration: expiration,
            loader: loader,
        }));

        expect(secondTime.result.current).toBe('foo');

        expect(loader).toBeCalledTimes(1);

        jest.advanceTimersByTime(step);

        const thirdTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            expiration: expiration,
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await flushPromises();

        await thirdTime.waitForNextUpdate();

        expect(thirdTime.result.current).toBe('foo');

        expect(loader).toBeCalledTimes(2);
    });

    it('should dispose the cache on unmount', async () => {
        jest.useFakeTimers();

        const delay = 10;
        const loader = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('foo'), delay)));

        const firstTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            expiration: 5,
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await flushPromises();

        firstTime.unmount();

        jest.advanceTimersByTime(6);

        await flushPromises();

        const secondTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            expiration: 5,
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await flushPromises();

        await secondTime.waitForNextUpdate();

        expect(secondTime.result.current).toBe('foo');

        expect(loader).toBeCalledTimes(2);
    });
});
