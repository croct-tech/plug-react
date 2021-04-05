import {useEffect, useState} from 'react';

type Loader = (...args: any) => Promise<any>;
type LoaderReturn<L extends Loader> = ReturnType<L> extends PromiseLike<infer U> ? U : never;

export type Configuration<L extends Loader> = {
    cacheKey: string,
    loader: L,
    fallback?: LoaderReturn<L>,
    initial?: LoaderReturn<L>,
    expiration?: number,
};

type CacheEntry<L extends Loader = Loader> = {
    promise: Promise<any>,
    result?: LoaderReturn<L>,
    dispose: () => void,
    timeout?: number,
    error?: any,
};

const DEFAULT_EXPIRATION = 60 * 1000;

const cache: Record<string, CacheEntry> = {};

export function useSuspense<L extends Loader>(configuration: Configuration<L>): LoaderReturn<L> {
    const {cacheKey, loader, initial, fallback, expiration = DEFAULT_EXPIRATION} = configuration;
    const [state, setState] = useState(initial);
    let isMounted: boolean = true;

    useEffect(() => () => {
        isMounted = false;
        cache[cacheKey]?.dispose();
    }, []);

    if (cache[cacheKey] !== undefined) {
        const entry = cache[cacheKey];

        if (entry.timeout !== undefined) {
            clearTimeout(entry.timeout);

            delete entry.timeout;

            entry.dispose();
        }

        if (entry.error !== undefined) {
            throw entry.error;
        }

        if (entry.result !== undefined) {
            return entry.result;
        }

        if (state !== undefined) {
            return state;
        }

        throw entry.promise;
    }

    const entry: CacheEntry<L> = {
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
            .then((result): LoaderReturn<L> => {
                entry.result = result;

                if (isMounted) {
                    setState(result);
                }

                return result;
            })
            .catch(error => {
                if (fallback === undefined) {
                    entry.error = error;
                } else {
                    entry.result = fallback;
                }

                if (isMounted) {
                    setState(fallback ?? undefined);
                }

                return fallback;
            })
            .finally(() => {
                entry.dispose();
            }),
    };

    cache[cacheKey] = entry;

    if (state !== undefined) {
        return state;
    }

    throw entry.promise;
}
