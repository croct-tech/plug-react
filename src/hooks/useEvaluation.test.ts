import {renderHook} from '@testing-library/react';
import {EvaluationOptions} from '@croct/sdk/facade/evaluatorFacade';
import {Plug} from '@croct/plug';
import {useEvaluation} from './useEvaluation';
import {useCroct} from './useCroct';
import {useLoader} from './useLoader';

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
        jest.resetModules();
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

        jest.mocked(useCroct).mockReturnValue({
            plug: {evaluate: evaluate} as Plug,
        });
        jest.mocked(useLoader).mockReturnValue('foo');

        const query = 'location';

        const {result} = renderHook(
            () => useEvaluation(query, {
                ...evaluationOptions,
                cacheKey: 'unique',
                fallback: 'error',
                expiration: 50,
            }),
        );

        expect(useCroct).toHaveBeenCalled();
        expect(useLoader).toHaveBeenCalledWith({
            cacheKey: 'useEvaluation:unique:location:{"foo":"bar"}',
            fallback: 'error',
            expiration: 50,
            loader: expect.any(Function),
        });

        jest.mocked(useLoader)
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

        jest.mocked(useCroct).mockReturnValue({
            plug: {evaluate: evaluate} as Plug,
        });
        jest.mocked(useLoader).mockReturnValue('foo');

        const query = 'location';

        renderHook(() => useEvaluation(query, evaluationOptions));

        jest.mocked(useLoader)
            .mock
            .calls[0][0]
            .loader();

        expect(evaluate).toHaveBeenCalledWith(query, {});
    });
});
