'use client';

import {Fragment, ReactElement, ReactNode} from 'react';
import {DynamicSlotId, SlotContent, VersionedSlotId, VersionedSlotMap} from '@croct/plug/slot';
import {JsonObject} from '@croct/plug/sdk/json';
import {FetchResponseOptions} from '@croct/sdk/contentFetcher';
import {FetchResponse, useContent, UseContentOptions} from '../../hooks';

type Renderer<P> = (props: P) => ReactNode;

export type SlotProps<
    P,
    I = P,
    F = P,
    S extends VersionedSlotId = VersionedSlotId,
    O extends FetchResponseOptions = FetchResponseOptions
> = O & UseContentOptions<I, F> & {
    id: S,
    children: Renderer<FetchResponse<P | I | F, O>>,
};

type SlotComponent = {
    <P, I, F, O extends FetchResponseOptions>(
        props:
            Extract<P | I | F, JsonObject> extends never
                ? SlotProps<JsonObject, never, never, keyof VersionedSlotMap extends never ? string : never, O>
                : SlotProps<P, I, F, keyof VersionedSlotMap extends never ? string : never, O>
    ): ReactElement,

    <S extends VersionedSlotId, O extends FetchResponseOptions>(
        props: SlotProps<SlotContent<S>, never, never, S, O>
    ): ReactElement,

    <I, S extends VersionedSlotId, O extends FetchResponseOptions>(
        props: SlotProps<SlotContent<S>, I, never, S, O>
    ): ReactElement,

    <F, S extends VersionedSlotId, O extends FetchResponseOptions>(
        props: SlotProps<SlotContent<S>, never, F, S, O>
    ): ReactElement,

    <I, F, S extends VersionedSlotId, O extends FetchResponseOptions>(
        props: SlotProps<SlotContent<S>, I, F, S, O>
    ): ReactElement,

    (props: SlotProps<void, void, void>): ReactElement,
};

export const Slot: SlotComponent = <I, F>(props: SlotProps<JsonObject, I, F>): ReactElement => {
    const {id, children, ...options} = props;
    const data = useContent<DynamicSlotId>(id, options);

    return <Fragment>{children(data)}</Fragment>;
};
