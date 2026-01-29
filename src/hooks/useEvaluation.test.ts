import {renderHook, waitFor} from '@testing-library/react';
import type {EvaluationOptions} from '@croct/sdk/facade/evaluatorFacade';
import type {Plug} from '@croct/plug';
import {useEvaluation} from './useEvaluation';
import {useCroct} from './useCroct';
import {useLoader} from './useLoader';
import {hash} from '../hash';

jest.mock(
    './useCroct',
    () => ({
        useCroct: jest.fn(),
    }),
);

jest.mock(
    './useLoader',
    () => ({
        useLoader: jest.fn(),
    }),
);

describe('useEvaluation', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should evaluate a query', () => {
        const evaluationOptions: EvaluationOptions = {
            timeout: 100,
            attributes: {
                foo: 'bar',
            },
        };

        const evaluate: Plug['evaluate'] = jest.fn();

        jest.mocked(useCroct).mockReturnValue({evaluate: evaluate} as Plug);
        jest.mocked(useLoader).mockReturnValue('foo');

        const query = 'location';
        const cacheKey = 'unique';

        const {result} = renderHook(
            () => useEvaluation(query, {
                ...evaluationOptions,
                cacheKey: cacheKey,
                fallback: 'error',
                expiration: 50,
            }),
        );

        expect(useCroct).toHaveBeenCalled();
        expect(useLoader).toHaveBeenCalledWith({
            cacheKey: hash(`useEvaluation:${cacheKey}:${query}:${JSON.stringify(evaluationOptions.attributes)}`),
            fallback: 'error',
            expiration: 50,
            loader: expect.any(Function),
        });

        void jest.mocked(useLoader)
            .mock
            .calls[0][0]
            .loader();

        expect(evaluate).toHaveBeenCalledWith(query, evaluationOptions);

        expect(result.current).toBe('foo');
    });

    it('should remove undefined evaluation options', () => {
        const evaluationOptions: EvaluationOptions = {
            timeout: undefined,
            attributes: undefined,
        };

        const evaluate: Plug['evaluate'] = jest.fn();

        jest.mocked(useCroct).mockReturnValue({evaluate: evaluate} as Plug);
        jest.mocked(useLoader).mockReturnValue('foo');

        const query = 'location';

        renderHook(() => useEvaluation(query, evaluationOptions));

        void jest.mocked(useLoader)
            .mock
            .calls[0][0]
            .loader();

        expect(evaluate).toHaveBeenCalledWith(query, {});
    });

    it('should use the initial value when the cache key changes if the stale-while-loading flag is false', async () => {
        const key = {
            current: 'initial',
        };

        const evaluate: Plug['evaluate'] = jest.fn();

        jest.mocked(useCroct).mockReturnValue({evaluate: evaluate} as Plug);

        jest.mocked(useLoader).mockImplementation(
            () => (key.current === 'initial' ? 'first' : 'second'),
        );

        const query = 'location';

        const {result, rerender} = renderHook(
            () => useEvaluation(query, {
                cacheKey: key.current,
                initial: 'initial',
            }),
        );

        expect(useCroct).toHaveBeenCalled();

        expect(useLoader).toHaveBeenCalledWith(expect.objectContaining({
            cacheKey: hash(`useEvaluation:${key.current}:${query}:${JSON.stringify({})}`),
            initial: 'initial',
        }));

        await waitFor(() => expect(result.current).toEqual('first'));

        key.current = 'next';

        rerender();

        expect(useLoader).toHaveBeenCalledWith(expect.objectContaining({
            cacheKey: hash(`useEvaluation:${key.current}:${query}:${JSON.stringify({})}`),
            initial: 'initial',
        }));

        await waitFor(() => expect(result.current).toEqual('second'));
    });

    it('should use the last evaluation result if the stale-while-loading flag is true', async () => {
        const key = {
            current: 'initial',
        };

        const evaluate: Plug['evaluate'] = jest.fn();

        jest.mocked(useCroct).mockReturnValue({evaluate: evaluate} as Plug);

        jest.mocked(useLoader).mockImplementation(
            () => (key.current === 'initial' ? 'first' : 'second'),
        );

        const query = 'location';

        const {result, rerender} = renderHook(
            () => useEvaluation(query, {
                cacheKey: key.current,
                initial: 'initial',
                staleWhileLoading: true,
            }),
        );

        expect(useCroct).toHaveBeenCalled();

        expect(useLoader).toHaveBeenCalledWith(expect.objectContaining({
            cacheKey: hash(`useEvaluation:${key.current}:${query}:${JSON.stringify({})}`),
            initial: 'initial',
        }));

        await waitFor(() => expect(result.current).toEqual('first'));

        key.current = 'next';

        rerender();

        expect(useLoader).toHaveBeenCalledWith(expect.objectContaining({
            cacheKey: hash(`useEvaluation:${key.current}:${query}:${JSON.stringify({})}`),
            initial: 'first',
        }));

        await waitFor(() => expect(result.current).toEqual('second'));
    });
});
