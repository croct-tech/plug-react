import {Fragment, ReactChild, ReactElement} from 'react';
import {SlotContent, SlotId, SlotMap} from '@croct/plug/fetch';
import {NullableJsonObject} from '@croct/plug/sdk/json';
import {useContent, UseContentOptions} from '../../hooks';

type Renderer<P> = (props: P) => ReactChild;

export type SlotProps<P, I = P, F = P, S extends SlotId = SlotId> = UseContentOptions<I, F> & {
    id: S,
    children: Renderer<P | I | F>,
};

export function Slot<P, I, F>(
    props:
        Extract<P | I | F, NullableJsonObject> extends never
            ? SlotProps<NullableJsonObject, never, never, keyof SlotMap extends never ? string : never>
            : SlotProps<P, I, F, keyof SlotMap extends never ? string : never>
): ReactElement;

export function Slot<S extends keyof SlotMap>(props: SlotProps<SlotContent<S>, never, never, S>): ReactElement;

export function Slot<I, S extends keyof SlotMap>(props: SlotProps<SlotContent<S>, I, never, S>): ReactElement;

export function Slot<F, S extends keyof SlotMap>(props: SlotProps<SlotContent<S>, never, F, S>): ReactElement;

export function Slot<I, F, S extends keyof SlotMap>(props: SlotProps<SlotContent<S>, I, F, S>): ReactElement;

export function Slot(props: SlotProps<void, void, void>): ReactElement;

export function Slot<I, F>(props: SlotProps<NullableJsonObject, I, F>): ReactElement {
    const {id, children, ...options} = props;
    const data: SlotContent<SlotId> | I | F = useContent(id, options);

    return <Fragment>{children(data)}</Fragment>;
}


// Valid
<Slot id={'home-banner'}>
    {(params: {foo: string}) => typeof params}
</Slot>;

// Invalid
<Slot id={'home-banner'}>
    {(params: true) => typeof params}
</Slot>;

// Valid
<Slot id={'home-banner'} initial={true}>
    {(params: {foo: string}|boolean) => typeof params}
</Slot>;

// Invalid
<Slot id={'home-banner'} initial={true}>
    {(params: {foo: string}) => typeof params}
</Slot>;

// Valid
<Slot id={'home-banner'} fallback={true}>
    {(params: {foo: string}|boolean) => typeof params}
</Slot>;

// Invalid
<Slot id={'home-banner'} fallback={true}>
    {(params: {foo: string}) => typeof params}
</Slot>;

// Valid
<Slot id={'home-banner'} initial={true} fallback={1}>
    {(params: {foo: string}|boolean|number) => typeof params}
</Slot>;

// Invalid
<Slot id={'home-banner'} initial={true} fallback={1}>
    {(params: {foo: string}|boolean) => typeof params}
</Slot>;
<Slot id={'home-banner'} initial={true} fallback={1}>
    {(params: {foo: string}|number) => typeof params}
</Slot>;

// ---

// Valid
<Slot id={'home-banner'}>
    {(params: {title: string}) => typeof params}
</Slot>;

// Invalid
<Slot id={'home-banner'}>
    {(params: {foo: string}) => typeof params}
</Slot>;

// Valid
<Slot id={'home-banner'} initial={true}>
    {(params: {title: string}|boolean) => typeof params}
</Slot>;

// Invalid
<Slot id={'home-banner'} initial={true}>
    {(params: {title: string}) => typeof params}
</Slot>;

// Valid
<Slot id={'home-banner'} fallback={true}>
    {(params: {title: string}|boolean) => typeof params}
</Slot>;

// Invalid
<Slot id={'home-banner'} fallback={true}>
    {(params: {title: string}) => typeof params}
</Slot>;

// Valid
<Slot id={'home-banner'} initial={true} fallback={1}>
    {(params: {title: string}|boolean|number) => typeof params}
</Slot>;

// Invalid
<Slot id={'home-banner'} initial={true} fallback={1}>
    {(params: {title: string}|boolean) => typeof params}
</Slot>;
<Slot id={'home-banner'} initial={true} fallback={1}>
    {(params: {title: string}|number) => typeof params}
</Slot>;
