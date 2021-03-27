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
        jest.useFakeTimers();
        cacheKey.next();
    });

    it('should return the initial state initially', async () => {
        const delay = 10;
        const loader = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('foo'), delay)));

        const {result, waitForNextUpdate} = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            initial: 'bar',
            loader: loader,
        }));

        expect(result.current).toBe('bar');

        jest.advanceTimersByTime(delay);

        await waitForNextUpdate();

        expect(result.current).toBe('foo');

        expect(loader).toBeCalled();
    });

    it('should return the fallback state on error', async () => {
        const delay = 10;
        // eslint-disable-next-line promise/param-names
        const loader = jest.fn(() => new Promise((_, reject) => setTimeout(() => reject(new Error('fail')), delay)));

        const firstTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            fallback: 'foo',
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await firstTime.waitForNextUpdate();

        expect(firstTime.result.current).toBe('foo');

        const secondTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            fallback: 'foo',
            loader: loader,
        }));

        expect(secondTime.result.current).toBe('foo');

        expect(loader).toBeCalled();
    });

    it('should cache the result on success', async () => {
        const delay = 10;
        const loader = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('foo'), delay)));

        const firstTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            loader: loader,
        }));

        const secondTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await firstTime.waitForNextUpdate();
        await secondTime.waitForNextUpdate();

        expect(firstTime.result.current).toBe('foo');
        expect(secondTime.result.current).toBe('foo');

        expect(loader).toBeCalledTimes(1);
    });

    it('should cache the result on error', async () => {
        const delay = 10;
        const error = new Error('fail');
        // eslint-disable-next-line promise/param-names
        const loader = jest.fn(() => new Promise((_, reject) => setTimeout(() => reject(error), delay)));

        const firstTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            loader: loader,
        }));

        const secondTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

        await firstTime.waitForNextUpdate();
        await secondTime.waitForNextUpdate();

        expect(firstTime.result.error).toBe(error);
        expect(secondTime.result.error).toBe(error);

        expect(loader).toBeCalledTimes(1);
    });

    it('should extend the cache expiration on every render', async () => {
        const delay = 10;
        const loader = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('foo'), delay)));

        const {waitForNextUpdate, rerender} = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            loader: loader,
            expiration: 15,
        }));

        jest.advanceTimersByTime(10);

        await waitForNextUpdate();

        jest.advanceTimersByTime(14);

        // First rerender
        rerender();

        jest.advanceTimersByTime(14);

        // Second rerender
        rerender();

        expect(loader).toBeCalledTimes(1);
    });

    it('should not expire the cache when the expiration is negative', async () => {
        const loader = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('foo'), 10)));

        const {waitForNextUpdate, rerender} = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            loader: loader,
            expiration: -1,
        }));

        jest.runAllTimers();

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
        const delay = 10;
        const loader = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('foo'), delay)));

        const firstTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            expiration: expiration,
            loader: loader,
        }));

        jest.advanceTimersByTime(delay);

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

        await thirdTime.waitForNextUpdate();

        expect(thirdTime.result.current).toBe('foo');

        expect(loader).toBeCalledTimes(2);
    });

    it('should dispose the cache on unmount', async () => {
        const delay = 10;
        const loader = jest.fn(() => new Promise(resolve => setTimeout(() => resolve('foo'), delay)));

        const firstTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            initial: 'foo',
            expiration: 5,
            loader: loader,
        }));

        firstTime.unmount();

        jest.advanceTimersByTime(6);

        const secondTime = renderHook(() => useSuspense({
            cacheKey: cacheKey.current(),
            expiration: 5,
            loader: loader,
        }));

        jest.advanceTimersByTime(10);

        await secondTime.waitForNextUpdate();

        expect(secondTime.result.current).toBe('foo');

        expect(loader).toBeCalledTimes(2);
    });
});
