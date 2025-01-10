import RedisService from '../services/redis/redisService.js';

export interface ICacheableOptions {
  // key to save in cache db
  key: string;

  // hash inputs formula
  hashGenerator(): string;

  // time of cache revalidation in seconds
  age: number;

  // should write the result to the cache (default is true)
  cacheResult?: boolean;

  // should read the result from the cache, if possible (default is true)
  readCache?: boolean;
}

// can be used inside a function that needed to be cached
export function useCacheable<R>(
  method: () => Promise<R>,
  options: ICacheableOptions
): Promise<R> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    const inputHash = options.hashGenerator();
    const key = options.key + '_' + inputHash;
    if (options.readCache || options.readCache === undefined) {
      console.log('r', key);
      const cacheResult = await RedisService.getObject<R>(key);
      if (cacheResult) resolve(cacheResult);
    }
    const result = await method();
    console.log('w', key);
    if (options.cacheResult || options.cacheResult === undefined)
      RedisService.saveObject(key, result, options.age);
    resolve(result);
  });
}
