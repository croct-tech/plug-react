import {ReactChild, ReactElement, Fragment} from 'react';
import {NullableJsonObject} from '@croct/plug/sdk/json';
import {SlotContent, SlotId} from '@croct/plug/fetch';
import {UseContentOptions, useContent} from '../../hooks/useContent';

type Renderer<P> = (props: P) => ReactChild;

export type SlotProps<
    P extends NullableJsonObject = NullableJsonObject,
    I extends SlotId = SlotId
> = UseContentOptions<P, I> & {
    id: I,
    children: Renderer<SlotContent<I> & P>,
};

export function Slot<P extends NullableJsonObject, I extends SlotId>(props: SlotProps<P, I>): ReactElement {
    const {id, children, ...options} = props;
    const data: SlotContent<I> & P = useContent(id, options);

    return <Fragment>{children(data)}</Fragment>;
}
