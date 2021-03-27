import {ReactChild, ReactElement, Fragment} from 'react';
import {JsonValue} from '@croct/plug/sdk/json';
import {UseEvaluationOptions, useEvaluation} from '../hooks/useEvaluation';

export type Renderer<T extends JsonValue> = (result: T) => ReactChild;

export type PersonalizationProps<T extends JsonValue = JsonValue> = UseEvaluationOptions<T> & {
    expression: string,
    children: Renderer<T>,
};

export function Personalization<T extends JsonValue>(props: PersonalizationProps<T>): ReactElement {
    const {expression, children, ...options} = props;
    const result: T = useEvaluation(expression, options);

    return (<Fragment>{children(result)}</Fragment>);
}
