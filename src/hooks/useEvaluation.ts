import {JsonValue} from '@croct/plug/sdk/json';
import {EvaluationOptions} from '@croct/sdk/facade/evaluatorFacade';
import {useSuspense} from './useSuspense';
import {useCroct} from './useCroct';

export type UseEvaluationOptions<T extends JsonValue> = EvaluationOptions & {
    fallback?: T,
    initial?: T,
    cacheKey?: string,
    expiration?: number,
};

export function useEvaluation<T extends JsonValue>(expression: string, options: UseEvaluationOptions<T> = {}): T {
    const {cacheKey, fallback, initial, expiration, ...evaluationOptions} = options;
    const croct = useCroct();

    return useSuspense({
        cacheKey: `evaluation:${cacheKey ?? ''}:${expression}:${JSON.stringify(options.attributes ?? '')}`,
        loader: () => croct.evaluate<T>(expression, evaluationOptions),
        fallback: fallback,
        initial: initial,
        expiration: expiration,
    });
}
