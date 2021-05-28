import {useEffect, useState} from 'react';
import {Loader, EntryOptions} from './loader';

const loader = new Loader(60 * 1000);

export type CacheOptions<R> = EntryOptions<R> & {
    initial?: R,
};

export function useLoader<R>({initial, ...options}: CacheOptions<R>): R {
    const loadedValue: R|undefined = loader.get<R>(options.cacheKey)?.result;
    const [value, setValue] = useState(loadedValue !== undefined ? loadedValue : initial);
    const [isUnmounted, setUnmounted] = useState(false);

    useEffect(
        () => {
            if (initial !== undefined) {
                try {
                    setValue(loader.load(options));
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
                loader.dispose(options.cacheKey);
                setUnmounted(true);
            };
        },
        [],
    );

    if (value === undefined) {
        return loader.load(options);
    }

    return value;
}
