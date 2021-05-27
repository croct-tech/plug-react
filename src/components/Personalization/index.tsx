import {ReactChild, ReactElement, Fragment} from 'react';
import {JsonValue} from '@croct/plug/sdk/json';
import {UseEvaluationOptions, useEvaluation} from '../../hooks';

type Renderer<T> = (result: T) => ReactChild;

export type PersonalizationProps<T extends JsonValue = JsonValue, I = never, F = never> = UseEvaluationOptions<I, F> & {
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

// Valid
<Personalization expression="aa">
    {(foo: string) => typeof foo}
</Personalization>;

// Invalid
<Personalization expression="aa">
    {(foo: Error) => typeof foo}
</Personalization>;

// Valid
<Personalization expression="aa" initial={true}>
    {(foo: string|boolean) => typeof foo}
</Personalization>;

// Invalid
<Personalization expression="aa" initial={true}>
    {(foo: string) => typeof foo}
</Personalization>;

// Valid
<Personalization expression="aa" fallback={1}>
    {(foo: string|number) => typeof foo}
</Personalization>;

// Invalid
<Personalization expression="aa" fallback={1}>
    {(foo: string) => typeof foo}
</Personalization>;

// Valid
<Personalization expression="aa" initial={true} fallback={1}>
    {(foo: string|boolean|number) => typeof foo}
</Personalization>;

// Invalid
<Personalization expression="aa" initial={true} fallback={1}>
    {(foo: string|boolean) => typeof foo}
</Personalization>;
<Personalization expression="aa" initial={true} fallback={1}>
    {(foo: string|number) => typeof foo}
</Personalization>;
