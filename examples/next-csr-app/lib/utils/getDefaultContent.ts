import type {JsonObject, SlotContent, VersionedSlotId} from '@croct/plug-react';
import {fetchContent} from '@croct/plug-react/api';

export function getDefaultContent<
    I extends VersionedSlotId,
    C extends JsonObject
>(slotId: I): Promise<SlotContent<I, C>> {
    const promise = fetchContent<I, C>(slotId, {
        static: true,
        apiKey: process.env.CROCT_API_KEY!,
    });

    return promise.then(({content}) => content);
}
