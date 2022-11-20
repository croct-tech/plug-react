import {Fragment, ReactElement, ReactNode} from 'react';
import {SlotContent, SlotId, VersionedSlotId, VersionedSlotMap} from '@croct/plug/slot';
import {JsonObject} from '@croct/plug/sdk/json';
import {useContent, UseContentOptions} from '../../hooks';

type Renderer<P> = (props: P) => ReactNode;

export type SlotProps<P, I = P, F = P, S extends VersionedSlotId = VersionedSlotId> = UseContentOptions<I, F> & {
    id: S,
    children: Renderer<P | I | F>,
};

type SlotComponent = {
    <P, I, F>(
        props:
            Extract<P | I | F, JsonObject> extends never
                ? SlotProps<JsonObject, never, never, keyof VersionedSlotMap extends never ? string : never>
                : SlotProps<P, I, F, keyof VersionedSlotMap extends never ? string : never>
    ): ReactElement,

    <S extends VersionedSlotId>(props: SlotProps<SlotContent<S>, never, never, S>): ReactElement,

    <I, S extends VersionedSlotId>(props: SlotProps<SlotContent<S>, I, never, S>): ReactElement,

    <F, S extends VersionedSlotId>(props: SlotProps<SlotContent<S>, never, F, S>): ReactElement,

    <I, F, S extends VersionedSlotId>(props: SlotProps<SlotContent<S>, I, F, S>): ReactElement,

    (props: SlotProps<void, void, void>): ReactElement,
};

export const Slot: SlotComponent = <I, F>(props: SlotProps<JsonObject, I, F>): ReactElement => {
    const {id, children, ...options} = props;
    const data: SlotContent<SlotId> | I | F = useContent(id, options);

    return <Fragment>{children(data)}</Fragment>;
};
