import {act, renderHook, waitFor} from '@testing-library/react';
import {StrictMode} from 'react';
import {useLoader} from './useLoader';

describe('useLoader', () => {
    const cacheKey = {
        index: 0,
        next: function next(): string {
            this.index++;

            return this.current();
        },
        current: function current(): string {
            return `key-${this.index}`;
        },
    };

    beforeEach(() => {
        cacheKey.next();
        jest.resetAllMocks();
        jest.clearAllTimers();
    });

    // Needed to use fake timers and promises:
    // https://github.com/testing-library/react-testing-library/issues/244#issuecomment-449461804
    function flushPromises(): Promise<void> {
        return Promise.resolve();
    }

    it('should return the load the value and cache on success', async () => {
        const loader = jest.fn().mockResolvedValue('foo');

        const {result, rerender} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                loader: loader,
            }),
        );

        rerender();

        await waitFor(() => expect(result.current).toBe('foo'));

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should load the value and cache on error', async () => {
        const error = new Error('fail');
        const loader = jest.fn().mockRejectedValue(error);

        const {result, rerender} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                fallback: error,
                loader: loader,
            }),
        );

        rerender();

        await waitFor(() => expect(result.current).toBe(error));

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should reload the value on error', async () => {
        const content = {foo: 'qux'};

        const loader = jest.fn()
            .mockImplementationOnce(() => {
                throw new Error('fail');
            })
            .mockImplementationOnce(() => Promise.resolve(content));

        const {result, rerender} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                initial: {},
                loader: loader,
            }),
        );

        await act(flushPromises);

        rerender();

        await waitFor(() => expect(result.current).toBe(content));

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('should return the initial state on the initial render', async () => {
        const loader = jest.fn(() => Promise.resolve('loaded'));

        const {result} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                initial: 'loading',
                loader: loader,
            }),
        );

        expect(result.current).toBe('loading');

        await waitFor(() => expect(result.current).toBe('loaded'));
    });

    it('should update the initial state with the fallback state on error', async () => {
        const loader = jest.fn().mockRejectedValue(new Error('fail'));

        const {result} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                initial: 'loading',
                fallback: 'error',
                loader: loader,
            }),
        );

        expect(result.current).toBe('loading');

        await waitFor(() => expect(result.current).toBe('error'));
    });

    it('should return the fallback state on error', async () => {
        const loader = jest.fn().mockRejectedValue(new Error('fail'));

        const {result} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                fallback: 'foo',
                loader: loader,
            }),
        );

        await waitFor(() => expect(result.current).toBe('foo'));

        expect(loader).toHaveBeenCalled();
    });

    it('should extend the cache expiration on every render', async () => {
        jest.useFakeTimers();

        const loader = jest.fn().mockResolvedValue('foo');

        const {rerender, unmount} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                loader: loader,
                expiration: 15,
            }),
        );

        await act(flushPromises);

        jest.advanceTimersByTime(14);

        rerender();

        jest.advanceTimersByTime(14);

        rerender();

        expect(loader).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(15);

        unmount();

        renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                loader: loader,
                expiration: 15,
            }),
        );

        await act(flushPromises);

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('should not expire the cache when the expiration is negative', async () => {
        jest.useFakeTimers();

        const loader = jest.fn(
            () => new Promise(resolve => {
                setTimeout(() => resolve('foo'), 10);
            }),
        );

        const {rerender} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                loader: loader,
                expiration: -1,
            }),
        );

        jest.advanceTimersByTime(10);

        await act(flushPromises);

        // First rerender
        rerender();

        // Second rerender
        rerender();

        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('should reload the value when the cache key changes without initial value', async () => {
        jest.useFakeTimers();

        const loader = jest.fn()
            .mockResolvedValueOnce('foo')
            .mockImplementationOnce(
                () => new Promise(resolve => {
                    setTimeout(() => resolve('bar'), 10);
                }),
            );

        const {result, rerender} = renderHook<any, {initial: string}>(
            props => useLoader({
                cacheKey: cacheKey.current(),
                loader: loader,
                initial: props?.initial,
            }),
        );

        await act(flushPromises);

        rerender();

        await waitFor(() => expect(result.current).toBe('foo'));

        expect(loader).toHaveBeenCalledTimes(1);

        cacheKey.next();

        rerender({initial: 'loading'});

        await waitFor(() => expect(result.current).toBe('loading'));

        jest.advanceTimersByTime(10);

        await waitFor(() => expect(result.current).toBe('bar'));

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('should reload the value when the cache key changes with initial value', async () => {
        jest.useFakeTimers();

        const loader = jest.fn()
            .mockImplementationOnce(
                () => new Promise(resolve => {
                    setTimeout(() => resolve('foo'), 10);
                }),
            )
            .mockImplementationOnce(
                () => new Promise(resolve => {
                    setTimeout(() => resolve('bar'), 10);
                }),
            );

        const {result, rerender} = renderHook<any, {initial: string}>(
            props => useLoader({
                cacheKey: cacheKey.current(),
                initial: props?.initial ?? 'first content',
                loader: loader,
            }),
        );

        await act(flushPromises);

        expect(result.current).toBe('first content');

        jest.advanceTimersByTime(10);

        await act(flushPromises);

        await waitFor(() => expect(result.current).toBe('foo'));

        expect(loader).toHaveBeenCalledTimes(1);

        cacheKey.next();

        rerender({initial: 'second content'});

        await waitFor(() => expect(result.current).toBe('second content'));

        jest.advanceTimersByTime(10);

        await act(flushPromises);

        await waitFor(() => expect(result.current).toBe('bar'));

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it.each<[number, number | undefined]>(
        [
            // [Expected elapsed time, Expiration]
            [60_000, undefined],
            [15_000, 15_000],
        ],
    )('should cache the values for %d milliseconds', async (step, expiration) => {
        jest.useFakeTimers();

        const delay = 10;
        const loader = jest.fn(
            () => new Promise(resolve => {
                setTimeout(() => resolve('foo'), delay);
            }),
        );

        const {result: firstTime} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                expiration: expiration,
                loader: loader,
            }),
        );

        jest.advanceTimersByTime(delay);

        await act(flushPromises);

        await waitFor(() => expect(firstTime.current).toBe('foo'));

        const {result: secondTime} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                expiration: expiration,
                loader: loader,
            }),
        );

        expect(secondTime.current).toBe('foo');

        expect(loader).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(step);

        const {result: thirdTime} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                expiration: expiration,
                loader: loader,
            }),
        );

        jest.advanceTimersByTime(delay);

        await act(flushPromises);

        await waitFor(() => expect(thirdTime.current).toBe('foo'));

        expect(loader).toHaveBeenCalledTimes(2);
    });

    it('should dispose the cache on unmount', async () => {
        jest.useFakeTimers();

        const delay = 10;
        const loader = jest.fn(
            () => new Promise(resolve => {
                setTimeout(() => resolve('foo'), delay);
            }),
        );

        const {unmount} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                expiration: 5,
                loader: loader,
            }),
        );

        jest.advanceTimersByTime(delay);

        await act(flushPromises);

        unmount();

        jest.advanceTimersByTime(5);

        await act(flushPromises);

        const {result: secondTime} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                expiration: 5,
                loader: loader,
            }),
        );

        jest.advanceTimersByTime(delay);

        await act(flushPromises);

        expect(loader).toHaveBeenCalledTimes(2);

        await waitFor(() => expect(secondTime.current).toBe('foo'));
    });

    it('should update the content in StrictMode', async () => {
        jest.useFakeTimers();

        const delay = 10;
        const loader = jest.fn(
            () => new Promise(resolve => {
                setTimeout(() => resolve('foo'), delay);
            }),
        );

        const {result} = renderHook(
            () => useLoader({
                cacheKey: cacheKey.current(),
                loader: loader,
                initial: 'bar',
            }),
            {
                wrapper: StrictMode,
            },
        );

        // Let the loader resolve
        await act(async () => {
            jest.advanceTimersByTime(delay);
            await flushPromises();
        });

        await waitFor(() => expect(result.current).toBe('foo'));
    });
});
