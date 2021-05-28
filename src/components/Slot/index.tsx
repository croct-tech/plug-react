import {Fragment, ReactChild, ReactElement} from 'react';
import {SlotContent, SlotId, SlotMap} from '@croct/plug/fetch';
import {NullableJsonObject} from '@croct/plug/sdk/json';
import {useContent, UseContentOptions} from '../../hooks';

type Renderer<P> = (props: P) => ReactChild;

export type SlotProps<P, I = P, F = P, S extends SlotId = SlotId> = UseContentOptions<I, F> & {
    id: S,
    children: Renderer<P | I | F>,
};

type SlotComponent = {
    <P, I, F>(
        props:
            Extract<P | I | F, NullableJsonObject> extends never
                ? SlotProps<NullableJsonObject, never, never, keyof SlotMap extends never ? string : never>
                : SlotProps<P, I, F, keyof SlotMap extends never ? string : never>
    ): ReactElement,

    <S extends keyof SlotMap>(props: SlotProps<SlotContent<S>, never, never, S>): ReactElement,

    <I, S extends keyof SlotMap>(props: SlotProps<SlotContent<S>, I, never, S>): ReactElement,

    <F, S extends keyof SlotMap>(props: SlotProps<SlotContent<S>, never, F, S>): ReactElement,

    <I, F, S extends keyof SlotMap>(props: SlotProps<SlotContent<S>, I, F, S>): ReactElement,

    (props: SlotProps<void, void, void>): ReactElement,
};

export const Slot: SlotComponent = <I, F>(props: SlotProps<NullableJsonObject, I, F>): ReactElement => {
    const {id, children, ...options} = props;
    const data: SlotContent<SlotId> | I | F = useContent(id, options);

    return <Fragment>{children(data)}</Fragment>;
};
