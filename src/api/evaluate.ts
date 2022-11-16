import {Evaluator, EvaluationOptions as BaseOptions} from '@croct/sdk/evaluator';
import {JsonValue} from '@croct/plug/sdk/json';

export type EvaluationOptions<T extends JsonValue = JsonValue> = BaseOptions & {
    apiKey: string,
    fallback?: T,
};

export function evaluate<T extends JsonValue>(query: string, options: EvaluationOptions<T>): Promise<T> {
    const {apiKey, fallback, ...rest} = options;
    const promise = (new Evaluator({apiKey: apiKey}))
        .evaluate(query, rest) as Promise<T>;

    if (fallback !== undefined) {
        return promise.catch(() => fallback);
    }

    return promise;
}
