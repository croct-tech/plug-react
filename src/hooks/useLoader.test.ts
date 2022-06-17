import {renderHook, waitFor} from '@testing-library/react';
import {setImmediate} from 'timers';
import {useLoader} from './useLoader';

describe('useLoader', () => {
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
        jest.clearAllTimers();
        jest.resetAllMocks();
    });

    // Needed to use fake timers and promises:
    // https://github.com/testing-library/react-testing-library/issues/244#issuecomment-449461804
    function flushPromises(): Promise<void> {
        return new Promise(resolve => {
            setImmediate(resolve);
        });
    }

    it('should return the load the value and cache on success', async () => {
        const loader = jest.fn().mockResolvedValue('foo');

        const {result, rerender} = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            loader: loader,
        }));

        rerender();

        await waitFor(() => expect(result.current).toBe('foo'));

        expect(loader).toBeCalledTimes(1);
    });

    it('should return the load the value and cache on error', async () => {
        const error = new Error('fail');
        const loader = jest.fn().mockRejectedValue(error);

        const {result, rerender} = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            fallback: error,
            loader: loader,
        }));

        rerender();

        await waitFor(() => expect(result.current).toBe(error));

        expect(loader).toBeCalledTimes(1);
    });

    it('should return the initial state on the initial render', async () => {
        const loader = jest.fn(() => Promise.resolve('loaded'));

        const {result} = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            initial: 'loading',
            loader: loader,
        }));

        expect(result.current).toBe('loading');

        await waitFor(() => expect(result.current).toBe('loaded'));
    });

    it('should update the initial state with the fallback state on error', async () => {
        const loader = jest.fn().mockRejectedValue(new Error('fail'));

        const {result} = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            initial: 'loading',
            fallback: 'error',
            loader: loader,
        }));

        expect(result.current).toBe('loading');

        await waitFor(() => expect(result.current).toBe('error'));
    });

    it('should return the fallback state on error', async () => {
        const loader = jest.fn().mockRejectedValue(new Error('fail'));

        const {result} = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            fallback: 'foo',
            loader: loader,
        }));

        await waitFor(() => expect(result.current).toBe('foo'));

        expect(loader).toBeCalled();
    });

    it('should extend the cache expiration on every render', async () => {
        jest.useFakeTimers();

        const loader = jest.fn().mockResolvedValue('foo');

        const {rerender, unmount} = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            loader: loader,
            expiration: 15,
        }));

        await flushPromises();

        jest.advanceTimersByTime(14);

        rerender();

        jest.advanceTimersByTime(14);

        rerender();

        expect(loader).toBeCalledTimes(1);

        jest.advanceTimersByTime(15);

        unmount();

        renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            loader: loader,
            expiration: 15,
        }));

        await flushPromises();

        expect(loader).toBeCalledTimes(2);
    });

    it('should not expire the cache when the expiration is negative', async () => {
        jest.useFakeTimers();

        const loader = jest.fn(() => new Promise(resolve => {
            setTimeout(() => resolve('foo'), 10);
        }));

        const {rerender} = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            loader: loader,
            expiration: -1,
        }));

        jest.advanceTimersByTime(10);

        await flushPromises();

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
        const loader = jest.fn(() => new Promise(resolve => {
            setTimeout(() => resolve('foo'), delay);
        }));

        const firstTime = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            expiration: expiration,
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await flushPromises();

        await waitFor(() => expect(firstTime.result.current).toBe('foo'));

        const secondTime = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            expiration: expiration,
            loader: loader,
        }));

        expect(secondTime.result.current).toBe('foo');

        expect(loader).toBeCalledTimes(1);

        jest.advanceTimersByTime(step);

        const thirdTime = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            expiration: expiration,
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await flushPromises();

        await waitFor(() => expect(thirdTime.result.current).toBe('foo'));

        expect(loader).toBeCalledTimes(2);
    });

    it('should dispose the cache on unmount', async () => {
        jest.useFakeTimers();

        const delay = 10;
        const loader = jest.fn(() => new Promise(resolve => {
            setTimeout(() => resolve('foo'), delay);
        }));

        const firstTime = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            expiration: 5,
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await flushPromises();

        firstTime.unmount();

        jest.advanceTimersByTime(5);

        await flushPromises();

        const secondTime = renderHook(() => useLoader({
            cacheKey: cacheKey.current(),
            expiration: 5,
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await flushPromises();

        await waitFor(() => expect(secondTime.result.current).toBe('foo'));

        // This expect can be return 2 or 3 sometimes by cache
        expect(loader).toBeCalledTimes(2);
    });
});
