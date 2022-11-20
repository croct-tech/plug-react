import {useEffect, useRef, useState} from 'react';
import {Cache, EntryOptions} from './Cache';

const cache = new Cache(60 * 1000);

export type CacheOptions<R> = EntryOptions<R> & {
    initial?: R,
};

export function useLoader<R>({initial, ...options}: CacheOptions<R>): R {
    const loadedValue: R|undefined = cache.get<R>(options.cacheKey)?.result;
    const [value, setValue] = useState(loadedValue !== undefined ? loadedValue : initial);
    const mountedRef = useRef(true);
    const optionsRef = useRef(initial !== undefined ? options : undefined);

    useEffect(
        () => {
            if (optionsRef.current !== undefined) {
                try {
                    setValue(cache.load(optionsRef.current));
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

                    return;
                }
            }

            return () => {
                mountedRef.current = false;
            };
        },
        [],
    );

    if (value === undefined) {
        return cache.load(options);
    }

    return value;
}
