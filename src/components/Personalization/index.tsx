import {ReactChild, ReactElement, Fragment} from 'react';
import {JsonValue} from '@croct/plug/sdk/json';
import {UseEvaluationOptions, useEvaluation} from '../../hooks';

type Renderer<T> = (result: T) => ReactChild;

export type PersonalizationProps<T = JsonValue, I = never, F = never> = UseEvaluationOptions<I, F> & {
    expression: string,
    children: Renderer<T | I | F>,
};

export function Personalization<T = JsonValue, I = never, F = never>(
    props: PersonalizationProps<T, I, F>,
): ReactElement {
    const {expression, children, ...options} = props;
    const result = useEvaluation<T, I, F>(expression, options);

    return (<Fragment>{children(result)}</Fragment>);
}
