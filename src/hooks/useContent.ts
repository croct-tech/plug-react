import {NullableJsonObject} from '@croct/plug/sdk/json';
import {SlotContent, SlotId} from '@croct/plug/fetch';
import {useSuspense} from './useSuspense';
import {useCroct} from './useCroct';

export type UseContentOptions<P extends NullableJsonObject = NullableJsonObject, I extends SlotId = SlotId> = {
    fallback?: SlotContent<I> & P,
    initial?: SlotContent<I> & P,
    cacheKey?: string,
    expiration?: number,
};

export function useContent<P extends NullableJsonObject, I extends SlotId = SlotId>(
    slotId: I,
    options: UseContentOptions<P, I> = {},
): SlotContent<I> & P {
    const {fallback, cacheKey, expiration} = options;
    const croct = useCroct();

    return useSuspense({
        cacheKey: `useContent:${cacheKey ?? ''}:${slotId}`,
        loader: () => croct.fetch<P>(slotId).then(({payload}) => payload),
        fallback: fallback,
        expiration: expiration,
    });
}
