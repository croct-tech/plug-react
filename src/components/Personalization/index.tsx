import {ReactChild, ReactElement, Fragment} from 'react';
import {JsonValue} from '@croct/plug/sdk/json';
import {UseEvaluationOptions, useEvaluation} from '../../hooks';

type Renderer<T> = (result: T) => ReactChild;

export type PersonalizationProps<T extends JsonValue = JsonValue, I = T, F = T> = UseEvaluationOptions<I, F> & {
    expression: string,
    children: Renderer<T | I | F>,
};

export function Personalization<T extends JsonValue, I, F>(
    props:
        Extract<T | I | F, JsonValue> extends never
            ? PersonalizationProps
            : PersonalizationProps<T, I, F>,
): ReactElement;

export function Personalization<I, F>(props: PersonalizationProps<JsonValue, I, F>): ReactElement {
    const {expression, children, ...options} = props;
    const result = useEvaluation(expression, options);

    return (<Fragment>{children(result)}</Fragment>);
}
