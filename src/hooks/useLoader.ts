import {useEffect, useState} from 'react';
import {Cache, EntryOptions} from './Cache';

const cache = new Cache(60 * 1000);

export type CacheOptions<R> = EntryOptions<R> & {
    initial?: R,
};

export function useLoader<R>({initial, ...options}: CacheOptions<R>): R {
    const loadedValue: R|undefined = cache.get<R>(options.cacheKey)?.result;
    const [value, setValue] = useState(loadedValue !== undefined ? loadedValue : initial);
    const [isUnmounted, setUnmounted] = useState(false);

    useEffect(
        () => {
            if (initial !== undefined) {
                try {
                    setValue(cache.load(options));
                } catch (result) {
                    if (!(result instanceof Promise)) {
                        setValue(undefined);

                        return;
                    }

                    result.then(resolvedValue => {
                        if (!isUnmounted) {
                            setValue(resolvedValue);
                        }
                    });
                }
            }

            return () => {
                setUnmounted(true);
            };
        },
        [],
    );

    if (value === undefined) {
        return cache.load(options);
    }

    return value;
}
