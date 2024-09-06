import {SlotContent, VersionedSlotId, VersionedSlotMap} from '@croct/plug/slot';
import {JsonObject} from '@croct/plug/sdk/json';
import {FetchOptions} from '@croct/plug/plug';
import {useLoader} from './useLoader';
import {useCroct} from './useCroct';
import {isSsr} from '../ssr-polyfills';
import {hash} from '../hash';

export type UseContentOptions<I, F> = FetchOptions & {
    fallback?: F,
    initial?: I,
    cacheKey?: string,
    expiration?: number,
};

function useCsrContent<I, F>(
    id: VersionedSlotId,
    options: UseContentOptions<I, F> = {},
): SlotContent | I | F {
    const {fallback, initial, cacheKey, expiration, ...fetchOptions} = options;
    const {preferredLocale} = fetchOptions;
    const croct = useCroct();

    return useLoader({
        cacheKey: hash(
            `useContent:${cacheKey ?? ''}`
            + `:${id}`
            + `:${preferredLocale ?? ''}`
            + `:${JSON.stringify(fetchOptions.attributes ?? '')}`,
        ),
        loader: () => croct.fetch(id, fetchOptions).then(({content}) => content),
        initial: initial,
        fallback: fallback,
        expiration: expiration,
    });
}

function useSsrContent<I, F>(
    _: VersionedSlotId,
    {initial}: UseContentOptions<I, F> = {},
): SlotContent | I | F {
    if (initial === undefined) {
        throw new Error(
            'The initial content is required for server-side rendering (SSR). '
            + 'For help, see https://croct.help/sdk/react/missing-initial-slot-content',
        );
    }

    return initial;
}

type UseContentHook = {
    <P extends JsonObject, I = P, F = P>(
        id: keyof VersionedSlotMap extends never ? string : never,
        options?: UseContentOptions<I, F>
    ): P | I | F,

    <S extends VersionedSlotId>(
        id: S,
        options?: UseContentOptions<never, never>
    ): SlotContent<S>,

    <I, S extends VersionedSlotId>(
        id: S,
        options?: UseContentOptions<I, never>
    ): SlotContent<S> | I,

    <F, S extends VersionedSlotId>(
        id: S,
        options?: UseContentOptions<never, F>
    ): SlotContent<S> | F,

    <I, F, S extends VersionedSlotId>(
        id: S,
        options?: UseContentOptions<I, F>
    ): SlotContent<S> | I | F,
};

export const useContent: UseContentHook = isSsr() ? useSsrContent : useCsrContent;
