import {SlotContent, VersionedSlotId, VersionedSlotMap} from '@croct/plug/slot';
import {JsonObject} from '@croct/plug/sdk/json';
import {FetchOptions} from '@croct/plug/plug';
import {useEffect, useState} from 'react';
import {useLoader} from './useLoader';
import {useCroct} from './useCroct';
import {isSsr} from '../ssr-polyfills';
import {hash} from '../hash';

export type UseContentOptions<I, F> = FetchOptions & {
    fallback?: F,
    initial?: I,
    cacheKey?: string,
    expiration?: number,
    staleWhileLoading?: boolean,
};

function useCsrContent<I, F>(
    id: VersionedSlotId,
    options: UseContentOptions<I, F> = {},
): SlotContent | I | F {
    const {
        fallback,
        cacheKey,
        expiration,
        initial: initialContent,
        staleWhileLoading = false,
        ...fetchOptions
    } = options;

    const [initial, setInitial] = useState<SlotContent | I | F | undefined>(initialContent);
    const {preferredLocale} = fetchOptions;
    const croct = useCroct();

    const result: SlotContent | I | F = useLoader({
        cacheKey: hash(
            `useContent:${cacheKey ?? ''}`
            + `:${id}`
            + `:${preferredLocale ?? ''}`
            + `:${JSON.stringify(fetchOptions.attributes ?? {})}`,
        ),
        loader: () => croct.fetch(id, fetchOptions).then(({content}) => content),
        initial: initial,
        fallback: fallback,
        expiration: expiration,
    });

    useEffect(
        () => {
            if (staleWhileLoading) {
                setInitial(current => {
                    if (current !== result) {
                        return result;
                    }

                    return current;
                });
            }
        },
        [result, staleWhileLoading],
    );

    return result;
}

function useSsrContent<I, F>(
    _: VersionedSlotId,
    {initial}: UseContentOptions<I, F> = {},
): SlotContent | I | F {
    if (initial === undefined) {
        throw new Error(
            'The initial content is required for server-side rendering (SSR). '
            + 'For help, see https://croct.help/sdk/react/missing-slot-content',
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
