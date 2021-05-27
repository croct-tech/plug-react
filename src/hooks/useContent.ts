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
        throw new Error('Initial is required for SSR.');
    }

    return initial;
}

export function useContent<P extends NullableJsonObject, I = P, F = P>(
    id: keyof SlotMap extends never ? string : never,
    options?: UseContentOptions<I, F>
): P | I | F;

export function useContent<S extends keyof SlotMap>(id: S, options?: UseContentOptions<never, never>): SlotContent<S>;

export function useContent<I, S extends keyof SlotMap>(id: S, options?: UseContentOptions<I, never>): SlotContent<S> | I;

export function useContent<F, S extends keyof SlotMap>(id: S, options?: UseContentOptions<never, F>): SlotContent<S> | F;

export function useContent<I, F, S extends keyof SlotMap>(id: S, options?: UseContentOptions<I, F>): SlotContent<S> | I | F;

export function useContent<I, F>(id: SlotId, options: UseContentOptions<I, F> = {}): SlotContent<SlotId> | I | F {
    return (isSsr() ? useSsrContent : useCsrContent)(id, options);
}



// Non-mapped
const test1Return = useContent('home-banner');
const test1Assert: NullableJsonObject = test1Return;

const test2Return = useContent('home-banner', {initial: true});
const test2Assert: NullableJsonObject | boolean = test2Return;

const test3Return = useContent('home-banner', {initial: true, fallback: 1});
const test3Assert: NullableJsonObject | boolean | number = test3Return;

const test4Return = useContent('home-banner', {fallback: 1});
const test4Assert: NullableJsonObject | number = test4Return;

const test5Return = useContent<{foo: string}>('home-banner');
const test5Assert: {foo: string} = test5Return;

const test6Return = useContent<{foo: string}, boolean>('home-banner', {initial: true});
const test6Assert: {foo: string}|boolean = test6Return;

const test7Return = useContent<{foo: string}, never, number>('home-banner', {fallback: 1});
const test7Assert: {foo: string}|number = test7Return;

const test8Return = useContent<{foo: string}, boolean, number>('home-banner', {initial: true, fallback: 1});
const test8Assert: {foo: string}|number|boolean = test8Return;

// Non-mapped invalid

useContent<true>('home-banner');


// Mapped

const testMapped1Return = useContent('home-banner');
const testMapped1Assert: SlotContent<'home-banner'> = testMapped1Return;

const testMapped2Return = useContent('home-banner', {initial: true});
const testMapped2Assert: SlotContent<'home-banner'> | boolean = testMapped2Return;

const testMapped3Return = useContent('home-banner', {initial: true, fallback: 1});
const testMapped3Assert: SlotContent<'home-banner'> | boolean | number = testMapped3Return;

const testMapped4Return = useContent('home-banner', {fallback: 1});
const testMapped4Assert: SlotContent<'home-banner'> | number = testMapped4Return;

// Mapped Invalid
useContent<{title: string}>('home-banner');



console.log(test1Assert, test2Assert, test3Assert, test4Assert, test5Assert, test6Assert, test7Assert, test8Assert);
console.log(testMapped1Assert, testMapped2Assert, testMapped3Assert, testMapped4Assert, testMapped5Assert, testMapped6Assert, testMapped7Assert, testMapped8Assert);
