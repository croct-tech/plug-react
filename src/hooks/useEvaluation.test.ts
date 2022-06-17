import {renderHook} from '@testing-library/react';
import {EvaluationOptions} from '@croct/sdk/facade/evaluatorFacade';
import {useEvaluation} from './useEvaluation';
import {useCroct} from './useCroct';
import {useLoader} from './useLoader';

jest.mock('./useCroct', () => ({
    useCroct: jest.fn(),
}));

jest.mock('./useLoader', () => ({
    useLoader: jest.fn(),
}));

describe('useEvaluation', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
    });

    it('should evaluate an expression', () => {
        const evaluationOptions: EvaluationOptions = {
            timeout: 100,
            attributes: {
                foo: 'bar',
            },
        };

        const evaluate = jest.fn();

        (useCroct as jest.Mock).mockReturnValue({evaluate: evaluate});
        (useLoader as jest.Mock).mockReturnValue('foo');

        const expression = 'location';

        const {result} = renderHook(() => useEvaluation(expression, {
            ...evaluationOptions,
            cacheKey: 'unique',
            fallback: 'error',
            expiration: 50,
        }));

        expect(useCroct).toBeCalled();
        expect(useLoader).toBeCalledWith({
            cacheKey: 'useEvaluation:unique:location:{"foo":"bar"}',
            fallback: 'error',
            expiration: 50,
            loader: expect.any(Function),
        });

        (useLoader as jest.Mock).mock.calls[0][0].loader();

        expect(evaluate).toBeCalledWith(expression, evaluationOptions);

        expect(result.current).toBe('foo');
    });

    it('should remove undefined evaluation options', () => {
        const evaluationOptions: EvaluationOptions = {
            timeout: undefined,
            attributes: undefined,
        };

        const evaluate = jest.fn();

        (useCroct as jest.Mock).mockReturnValue({evaluate: evaluate});
        (useLoader as jest.Mock).mockReturnValue('foo');

        const expression = 'location';

        renderHook(() => useEvaluation(expression, evaluationOptions));

        (useLoader as jest.Mock).mock.calls[0][0].loader();

        expect(evaluate).toBeCalledWith(expression, {});
    });
});
