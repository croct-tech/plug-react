import {renderHook} from '@testing-library/react-hooks';
import {EvaluationOptions} from '@croct/sdk/facade/evaluatorFacade';
import {useEvaluation} from './useEvaluation';
import {useCroct} from './useCroct';
import {useSuspense} from './useSuspense';

jest.mock('./useCroct', () => ({
    useCroct: jest.fn(),
}));

jest.mock('./useSuspense', () => ({
    useSuspense: jest.fn(),
}));

describe('useEvaluation', () => {
    it('should evaluate an expression', () => {
        const evaluationOptions: EvaluationOptions = {
            timeout: 100,
            attributes: {
                foo: 'bar',
            },
        };

        const evaluate = jest.fn();

        (useCroct as jest.Mock).mockReturnValue({evaluate: evaluate});
        (useSuspense as jest.Mock).mockReturnValue('foo');

        const expression = 'location';

        const {result} = renderHook(() => useEvaluation(expression, {
            ...evaluationOptions,
            cacheKey: 'unique',
            initial: 'loading',
            fallback: 'error',
            expiration: 50,
        }));

        expect(useCroct).toBeCalled();
        expect(useSuspense).toBeCalledWith({
            cacheKey: 'evaluation:unique:location:{"foo":"bar"}',
            initial: 'loading',
            fallback: 'error',
            expiration: 50,
            loader: expect.any(Function),
        });

        (useSuspense as jest.Mock).mock.calls[0][0].loader();

        expect(evaluate).toBeCalledWith(expression, evaluationOptions);

        expect(result.current).toBe('foo');
    });
});
