import {useCallback, useEffect, useRef, useState} from 'react';
import {Cache, EntryOptions} from './Cache';

const cache = new Cache(60 * 1000);

export type CacheOptions<R> = EntryOptions<R> & {
    initial?: R,
};

export function useLoader<R>({initial, ...options}: CacheOptions<R>): R {
    const {cacheKey} = options;
    const loadedValue: R|undefined = cache.get<R>(cacheKey)?.result;
    const [value, setValue] = useState(loadedValue !== undefined ? loadedValue : initial);
    const mountedRef = useRef(true);
    const initialRef = useRef(initial);
    const previousCacheKey = useRef(cacheKey);

    const load = useStableCallback(() => {
        try {
            setValue(cache.load(options));
        } catch (result: unknown) {
            if (result instanceof Promise) {
                result.then((resolvedValue: R) => {
                    if (mountedRef.current) {
                        setValue(resolvedValue);
                    }
                });

                return;
            }

            setValue(undefined);
        }
    });

    const reset = useStableCallback(() => {
        const newLoadedValue: R|undefined = cache.get<R>(cacheKey)?.result;

        setValue(newLoadedValue !== undefined ? newLoadedValue : initial);

        load();
    });

    useEffect(
        () => {
            if (previousCacheKey.current !== cacheKey) {
                reset();
                previousCacheKey.current = cacheKey;
            }
        },
        [reset, cacheKey],
    );

    useEffect(
        () => {
            if (initialRef.current !== undefined) {
                load();
            }

            return () => {
                mountedRef.current = false;
            };
        },
        [load],
    );

    if (value === undefined) {
        return cache.load(options);
    }

    return value;
}

type Callback = () => void;

function useStableCallback(callback: Callback): Callback {
    const ref = useRef<Callback>();

    useEffect(() => {
        ref.current = callback;
    });

    return useCallback(() => { ref.current?.(); }, []);
}
