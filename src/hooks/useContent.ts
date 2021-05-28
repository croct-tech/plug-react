import {SlotContent, SlotId, SlotMap} from '@croct/plug/fetch';
import {NullableJsonObject} from '@croct/plug/sdk/json';
import {useLoader} from './useLoader';
import {useCroct} from './useCroct';
import {isSsr} from '../ssr';

export type UseContentOptions<I, F> = {
    fallback?: F,
    initial?: I,
    cacheKey?: string,
    expiration?: number,
};

function useCsrContent<I, F>(id: SlotId, options: UseContentOptions<I, F> = {}): SlotContent<SlotId> | I | F {
    const {fallback, initial, cacheKey, expiration} = options;
    const croct = useCroct();

    return useLoader({
        cacheKey: `useContent:${cacheKey ?? ''}:${id}`,
        loader: () => croct.fetch<SlotContent<SlotId>>(id).then(({payload}) => payload),
        initial: initial,
        fallback: fallback,
        expiration: expiration,
    });
}

function useSsrContent<I, F>(_: SlotId, {initial}: UseContentOptions<I, F> = {}): SlotContent<SlotId> | I | F {
    if (initial === undefined) {
        throw new Error('The initial value is required for server-side rendering (SSR).');
    }

    return initial;
}

type UseContentHook = {
    <P extends NullableJsonObject, I = P, F = P>(
        id: keyof SlotMap extends never ? string : never,
        options?: UseContentOptions<I, F>
    ): P | I | F,

    <S extends keyof SlotMap>(
        id: S,
        options?: UseContentOptions<never, never>
    ): SlotContent<S>,

    <I, S extends keyof SlotMap>(
        id: S,
        options?: UseContentOptions<I, never>
    ): SlotContent<S> | I,

    <F, S extends keyof SlotMap>(
        id: S,
        options?: UseContentOptions<never, F>
    ): SlotContent<S> | F,

    <I, F, S extends keyof SlotMap>(
        id: S,
        options?: UseContentOptions<I, F>
    ): SlotContent<S> | I | F,
};

export const useContent: UseContentHook = isSsr() ? useSsrContent : useCsrContent;
