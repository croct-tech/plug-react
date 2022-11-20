import {
    ContentFetcher,
    DynamicContentOptions as BaseDynamicOptions,
    StaticContentOptions as BaseStaticOptions,
} from '@croct/sdk/contentFetcher';
import {JsonObject} from '@croct/plug/sdk/json';
import {FetchResponse} from '@croct/plug/plug';
import {SlotContent, VersionedSlotId} from '@croct/plug/slot';

type ServerSideOptions<T extends JsonObject> = {
    apiKey: string,
    fallback?: T,
};

export type DynamicContentOptions<T extends JsonObject = JsonObject> =
    Omit<BaseDynamicOptions, 'version'> & ServerSideOptions<T>;

export type StaticContentOptions<T extends JsonObject = JsonObject> =
    Omit<BaseStaticOptions, 'version'> & ServerSideOptions<T>;

export type FetchOptions<T extends JsonObject = JsonObject> = DynamicContentOptions<T> | StaticContentOptions<T>;

export function fetchContent<I extends VersionedSlotId, C extends JsonObject>(
    slotId: I,
    options?: FetchOptions<SlotContent<I, C>>,
): Promise<Omit<FetchResponse<I, C>, 'payload'>> {
    const {apiKey, fallback, ...fetchOptions} = options ?? {};
    const promise = (new ContentFetcher({apiKey: apiKey}))
        .fetch<SlotContent<I, C>>(slotId, fetchOptions);

    if (fallback !== undefined) {
        return promise.catch(
            () => ({
                content: fallback,
            }),
        );
    }

    return promise;
}