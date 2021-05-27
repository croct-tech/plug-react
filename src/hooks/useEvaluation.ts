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

type UseEvaluationHook = {
    <T extends JsonValue, I = T, F = T>(
        expression: string,
        options?: UseEvaluationOptions<I, F>,
    ): T | I | F,
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

export const useEvaluation: UseEvaluationHook = isSsr() ? useSsrEvaluation : useCsrEvaluation;

const test1Result = useEvaluation('x');
const test1Assert: JsonValue = test1Result;

const test2Result = useEvaluation<string>('x');
const test2Assert: string = test2Result;

const test3Result = useEvaluation('x', {initial: undefined});
const test3Assert: JsonValue|undefined = test3Result;

const test4Result = useEvaluation('x', {fallback: new Error()});
const test4Assert: JsonValue|Error = test4Result;

const test5Result = useEvaluation('x', {initial: undefined, fallback: new Error()});
const test5Assert: JsonValue|undefined|Error = test5Result;

const test6Result = useEvaluation<string, undefined, Error>('x', {initial: undefined, fallback: new Error()});
const test6Assert: string|undefined|Error = test6Result;

useEvaluation<undefined>('x');

console.log(test1Assert, test2Assert, test3Assert, test4Assert, test5Assert, test6Assert);
