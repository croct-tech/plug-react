import {JsonValue} from '@croct/plug/sdk/json';
import {EvaluationOptions} from '@croct/sdk/facade/evaluatorFacade';
import {useLoader} from './useLoader';
import {useCroct} from './useCroct';
import {isSsr} from '../ssr';

function cleanEvaluationOptions(options: EvaluationOptions): EvaluationOptions {
    const result: EvaluationOptions = {};

    for (const [key, value] of Object.entries(options)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }

    return result;
}

export type UseEvaluationOptions<I, F> = EvaluationOptions & {
    initial?: I,
    fallback?: F,
    cacheKey?: string,
    expiration?: number,
};

function useCsrEvaluation<T = JsonValue, I = T, F = T>(
    expression: string,
    options: UseEvaluationOptions<I, F> = {},
): T | I | F {
    const {cacheKey, fallback, initial, expiration, ...evaluationOptions} = options;
    const croct = useCroct();

    return useLoader<T | I | F>({
        cacheKey: `useEvaluation:${cacheKey ?? ''}:${expression}:${JSON.stringify(options.attributes ?? '')}`,
        loader: () => croct.evaluate<T & JsonValue>(expression, cleanEvaluationOptions(evaluationOptions)),
        initial: initial,
        fallback: fallback,
        expiration: expiration,
    });
}

function useSsrEvaluation<T = JsonValue, I = T, F = T>(
    _: string,
    {initial}: UseEvaluationOptions<I, F> = {},
): T | I | F {
    if (initial === undefined) {
        throw new Error('Initial is required for SSR.');
    }

    return initial;
}

export const useEvaluation = isSsr() ? useSsrEvaluation : useCsrEvaluation;
