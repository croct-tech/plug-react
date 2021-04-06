import {useEffect} from 'react';

type Loader = (...args: any) => Promise<any>;
type LoaderReturn<L extends Loader> = ReturnType<L> extends PromiseLike<infer U> ? U : never;

export type Configuration<L extends Loader> = {
    cacheKey: string,
    loader: L,
    fallback?: LoaderReturn<L>,
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
    const {cacheKey, loader, fallback, expiration = DEFAULT_EXPIRATION} = configuration;

    useEffect(() => () => {
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

                return result;
            })
            .catch(error => {
                entry.error = error;

                throw error;
            })
            .finally(() => {
                entry.dispose();
            }),
    };

    cache[cacheKey] = entry;

    throw entry.promise;
}
