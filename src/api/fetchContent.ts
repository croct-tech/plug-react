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
    baseEndpointUrl?: string,
    fallback?: T,
};

export type DynamicContentOptions<T extends JsonObject = JsonObject> =
    Omit<BaseDynamicOptions, 'version'> & ServerSideOptions<T>;

export type StaticContentOptions<T extends JsonObject = JsonObject> =
    Omit<BaseStaticOptions, 'version'> & ServerSideOptions<T>;

export type FetchOptions<T extends JsonObject = SlotContent> = DynamicContentOptions<T> | StaticContentOptions<T>;

export function fetchContent<I extends VersionedSlotId, C extends JsonObject>(
    slotId: I,
    options?: FetchOptions<SlotContent<I, C>>,
): Promise<Omit<FetchResponse<I, C>, 'payload'>> {
    const {apiKey, fallback, baseEndpointUrl, ...fetchOptions} = options ?? {};
    const [id, version = 'latest'] = slotId.split('@') as [I, `${number}` | 'latest' | undefined];

    const promise = (new ContentFetcher({apiKey: apiKey, baseEndpointUrl: baseEndpointUrl}))
        .fetch<SlotContent<I, C>>(
            id,
            version === 'latest'
                ? fetchOptions
                : {...fetchOptions, version: version},
        );

    if (fallback !== undefined) {
        return promise.catch(
            () => ({
                content: fallback,
            }),
        );
    }

    return promise;
}
