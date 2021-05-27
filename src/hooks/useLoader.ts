import {useEffect, useState} from 'react';

type Loader<R> = (...args: any) => Promise<R>;

export type Configuration<R> = {
    cacheKey: string,
    loader: Loader<R>,
    initial?: R,
    fallback?: R,
    expiration?: number,
};

type CacheEntry<R = any> = {
    promise: Promise<any>,
    result?: R,
    dispose: () => void,
    timeout?: number,
    error?: any,
};

const DEFAULT_EXPIRATION = 60 * 1000;

const cache: Record<string, CacheEntry> = {};

function dispose(cacheKey: string): void {
    cache[cacheKey]?.dispose();
}

function get<T>(cacheKey: string): T {
    return cache[cacheKey]?.result;
}

function load<R>(configuration: Configuration<R>): R {
    const {cacheKey, loader, fallback, expiration = DEFAULT_EXPIRATION} = configuration;

    if (cache[cacheKey] !== undefined) {
        const entry = cache[cacheKey];

        if (entry.timeout !== undefined) {
            clearTimeout(entry.timeout);

            delete entry.timeout;

            entry.dispose();
        }

        if (entry.error !== undefined) {
            if (fallback !== undefined) {
                return fallback;
            }

            throw entry.error;
        }

        if (entry.result !== undefined) {
            return entry.result;
        }

        throw entry.promise;
    }

    const entry: CacheEntry<R> = {
        dispose: () => {
            if (entry.timeout !== undefined || expiration < 0) {
                return;
            }

            entry.timeout = window.setTimeout(
                (): void => {
                    delete cache[cacheKey];
                },
                expiration,
            );
        },
        promise: loader()
            .then((result): R => {
                entry.result = result;

                return result;
            })
            .catch(error => {
                entry.error = error;
            })
            .finally(() => {
                entry.dispose();
            }),
    };

    cache[cacheKey] = entry;

    throw entry.promise;
}

export function useLoader<R>({initial, ...configuration}: Configuration<R>): R {
    const loadedValue: R|undefined = get(configuration.cacheKey);
    const [value, setValue] = useState(loadedValue !== undefined ? loadedValue : initial);
    const [isUnmounted, setUnmounted] = useState(false);

    useEffect(
        () => {
            if (initial !== undefined) {
                try {
                    setValue(load(configuration));
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
                dispose(configuration.cacheKey);
                setUnmounted(true);
            };
        },
        [],
    );

    if (value === undefined) {
        return load(configuration);
    }

    return value;
}
