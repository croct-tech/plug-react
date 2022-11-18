import {ReactElement, Fragment} from 'react';
import {JsonValue} from '@croct/plug/sdk/json';
import {UseEvaluationOptions, useEvaluation} from '../../hooks';

type Renderer<T> = (result: T) => ReactElement | string | number;

export type PersonalizationProps<T extends JsonValue = JsonValue, I = T, F = T> = UseEvaluationOptions<I, F> & {
    query: string,
    children: Renderer<T | I | F>,
};

export function Personalization<T extends JsonValue, I, F>(
    props:
        Extract<T | I | F, JsonValue> extends never
            ? PersonalizationProps
            : PersonalizationProps<T, I, F>,
): ReactElement;

export function Personalization<I, F>(props: PersonalizationProps<JsonValue, I, F>): ReactElement {
    const {query, children, ...options} = props;
    const result = useEvaluation(query, options);

    return (<Fragment>{children(result)}</Fragment>);
}
