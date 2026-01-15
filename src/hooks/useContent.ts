'use client';

import {SlotContent, VersionedSlotId, VersionedSlotMap} from '@croct/plug/slot';
import {JsonObject} from '@croct/plug/sdk/json';
import {FetchOptions} from '@croct/plug/plug';
import {useEffect, useMemo, useState} from 'react';
import {getSlotContent} from '@croct/content';
import {FetchResponse as BaseFetchResponse, FetchResponseOptions} from '@croct/sdk/contentFetcher';
import {Optional} from '@croct/sdk/utilityTypes';
import {useLoader} from './useLoader';
import {useCroct} from './useCroct';
import {isSsr} from '../ssr-polyfills';
import {hash} from '../hash';

export type FetchResponse<P = JsonObject, O = FetchResponseOptions> = Optional<BaseFetchResponse<P, O>, 'metadata'>;

export type UseContentOptions<I, F> = FetchOptions<F> & {
    initial?: I,
    cacheKey?: string,
    expiration?: number,
    staleWhileLoading?: boolean,
};

function useCsrContent<I, F, O extends FetchResponseOptions>(
    id: VersionedSlotId,
    options: UseContentOptions<I, F> = {},
): FetchResponse<SlotContent | I | F, O> {
    const {
        cacheKey,
        expiration,
        fallback: fallbackContent,
        initial: initialContent,
        staleWhileLoading = false,
        preferredLocale,
        ...fetchOptions
    } = options;

    const normalizedLocale = normalizePreferredLocale(preferredLocale);
    const defaultContent = useMemo(
        () => getSlotContent(id, normalizedLocale) as SlotContent|null ?? undefined,
        [id, normalizedLocale],
    );
    const fallback = fallbackContent === undefined ? defaultContent : fallbackContent;
    const [initial, setInitial] = useState(
        () => {
            const content = initialContent === undefined ? defaultContent : initialContent;

            if (content === undefined) {
                return undefined;
            }

            return {content: content};
        },
    );

    const croct = useCroct();

    const result = useLoader({
        cacheKey: hash(
            `useContent:${cacheKey ?? ''}`
            + `:${id}`
            + `:${normalizedLocale ?? ''}`
            + `:${JSON.stringify(fetchOptions?.attributes ?? {})}`,
        ),
        loader: () => croct.fetch<VersionedSlotId, FetchResponseOptions>(id, {
            ...fetchOptions,
            ...(normalizedLocale !== undefined ? {preferredLocale: normalizedLocale} : {}),
            ...(fallback !== undefined ? {fallback: fallback} : {}),
        }),
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

function useSsrContent<I, F, O extends FetchResponseOptions>(
    slotId: VersionedSlotId,
    options: UseContentOptions<I, F> = {},
): FetchResponse<SlotContent | I | F, O> {
    const {initial, preferredLocale} = options;
    const resolvedInitialContent = initial === undefined
        ? getSlotContent(slotId, normalizePreferredLocale(preferredLocale)) as I|null ?? undefined
        : initial;

    if (resolvedInitialContent === undefined) {
        throw new Error(
            'The initial content is required for server-side rendering (SSR). '
            + 'For help, see https://croct.help/sdk/react/missing-slot-content',
        );
    }

    return {content: resolvedInitialContent};
}

function normalizePreferredLocale(preferredLocale: string|undefined): string|undefined {
    return preferredLocale !== undefined && preferredLocale !== '' ? preferredLocale : undefined;
}

type UseContentHook = {
    <P extends JsonObject, I = P, F = P, O extends FetchResponseOptions = FetchResponseOptions>(
        id: keyof VersionedSlotMap extends never ? string : never,
        options?: O & UseContentOptions<I, F>
    ): FetchResponse<P | I | F, O>,

    <S extends VersionedSlotId, O extends FetchResponseOptions = FetchResponseOptions>(
        id: S,
        options?: O & UseContentOptions<never, never>
    ): FetchResponse<SlotContent<S>, O>,

    <I, S extends VersionedSlotId, O extends FetchResponseOptions = FetchResponseOptions>(
        id: S,
        options?: O & UseContentOptions<I, never>
    ): FetchResponse<SlotContent<S> | I, O>,

    <F, S extends VersionedSlotId, O extends FetchResponseOptions = FetchResponseOptions>(
        id: S,
        options?: O & UseContentOptions<never, F>
    ): FetchResponse<SlotContent<S> | F, O>,

    <I, F, S extends VersionedSlotId, O extends FetchResponseOptions = FetchResponseOptions>(
        id: S,
        options?: O & UseContentOptions<I, F>
    ): FetchResponse<SlotContent<S> | I | F, O>,
};

export const useContent: UseContentHook = isSsr() ? useSsrContent : useCsrContent;
