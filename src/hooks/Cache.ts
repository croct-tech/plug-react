export type EntryLoader<R> = (...args: any) => Promise<R>;

export type EntryOptions<R> = {
    cacheKey: string,
    loader: EntryLoader<R>,
    fallback?: R,
    expiration?: number,
};

type Entry<R = any> = {
    promise: Promise<any>,
    result?: R,
    dispose: () => void,
    timeout?: number,
    error?: any,
};

/**
 * @internal
 */
export class Cache {
    private readonly cache: Record<string, Entry> = {};

    private readonly defaultExpiration: number;

    public constructor(defaultExpiration: number) {
        this.defaultExpiration = defaultExpiration;
    }

    public load<R>(configuration: EntryOptions<R>): R {
        const {cacheKey, loader, fallback, expiration = this.defaultExpiration} = configuration;

        const cachedEntry = this.get<R>(cacheKey);

        if (cachedEntry !== undefined) {
            if (cachedEntry.error !== undefined) {
                if (fallback !== undefined) {
                    return fallback;
                }

                if (cachedEntry.result === undefined) {
                    throw cachedEntry.error;
                }
            }

            if (cachedEntry.result !== undefined) {
                return cachedEntry.result;
            }

            throw cachedEntry.promise;
        }

        const entry: Entry<R> = {
            dispose: () => {
                if (entry.timeout !== undefined || expiration < 0) {
                    return;
                }

                entry.timeout = window.setTimeout(
                    (): void => {
                        delete this.cache[cacheKey];
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
                    entry.result = fallback;
                    entry.error = error;

                    return fallback;
                })
                .finally(() => {
                    entry.dispose();
                }),
        };

        this.cache[cacheKey] = entry;

        throw entry.promise;
    }

    public get<R>(cacheKey: string): Entry<R>|undefined {
        const entry = this.cache[cacheKey];

        if (entry === undefined) {
            return undefined;
        }

        if (entry.timeout !== undefined) {
            clearTimeout(entry.timeout);

            delete entry.timeout;

            entry.dispose();
        }

        return entry;
    }
}
