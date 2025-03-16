import {useCallback, useEffect, useRef, useState} from 'react';
import {Cache, EntryOptions} from './Cache';

const cache = new Cache(60 * 1000);

export type CacheOptions<R> = EntryOptions<R> & {
    initial?: R,
};

/**
 * @internal
 */
export function useLoader<R>({initial, ...currentOptions}: CacheOptions<R>): R {
    const optionsRef = useRef(currentOptions);
    const [value, setValue] = useState(() => cache.get<R>(currentOptions.cacheKey)?.result ?? initial);
    const mountedRef = useRef(true);

    const load = useCallback(
        (options: EntryOptions<R>) => {
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
        },
        [],
    );

    useEffect(
        () => {
            mountedRef.current = true;

            if (initial !== undefined) {
                load(currentOptions);
            }

            return () => {
                mountedRef.current = false;
            };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Should run only once
        [],
    );

    useEffect(
        () => {
            if (optionsRef.current.cacheKey !== currentOptions.cacheKey) {
                setValue(initial);
                optionsRef.current = currentOptions;

                if (initial !== undefined) {
                    load(currentOptions);
                }
            }
        },
        [currentOptions, initial, load],
    );

    if (value === undefined) {
        return cache.load(currentOptions);
    }

    return value;
}
