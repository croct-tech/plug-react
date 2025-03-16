import {SlotContent, VersionedSlotId, VersionedSlotMap} from '@croct/plug/slot';
import {JsonObject} from '@croct/plug/sdk/json';
import {FetchOptions} from '@croct/plug/plug';
import {useEffect, useMemo, useState} from 'react';
import {getSlotContent} from '@croct/content';
import {useLoader} from './useLoader';
import {useCroct} from './useCroct';
import {isSsr} from '../ssr-polyfills';
import {hash} from '../hash';

export type UseContentOptions<I, F> = FetchOptions<F> & {
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
        cacheKey,
        expiration,
        fallback: fallbackContent,
        initial: initialContent,
        staleWhileLoading = false,
        ...fetchOptions
    } = options;

    const {preferredLocale} = fetchOptions;
    const defaultContent = useMemo(
        () => getSlotContent(id, preferredLocale) as SlotContent|null ?? undefined,
        [id, preferredLocale],
    );
    const fallback = fallbackContent === undefined ? defaultContent : fallbackContent;
    const [initial, setInitial] = useState<SlotContent | I | F | undefined>(
        () => (initialContent === undefined ? defaultContent : initialContent),
    );

    const croct = useCroct();

    const result: SlotContent | I | F = useLoader({
        cacheKey: hash(
            `useContent:${cacheKey ?? ''}`
            + `:${id}`
            + `:${preferredLocale ?? ''}`
            + `:${JSON.stringify(fetchOptions.attributes ?? {})}`,
        ),
        loader: () => croct.fetch(id, {...fetchOptions, fallback: fallback}).then(({content}) => content),
        initial: initial,
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
    slotId: VersionedSlotId,
    {initial, preferredLocale}: UseContentOptions<I, F> = {},
): SlotContent | I | F {
    const resolvedInitialContent = initial === undefined
        ? getSlotContent(slotId, preferredLocale) as I|null ?? undefined
        : initial;

    if (resolvedInitialContent === undefined) {
        throw new Error(
            'The initial content is required for server-side rendering (SSR). '
            + 'For help, see https://croct.help/sdk/react/missing-slot-content',
        );
    }

    return resolvedInitialContent;
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
