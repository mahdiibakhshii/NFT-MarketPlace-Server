import IService from '../IService';
import Redis from 'ioredis';

type ListenCallback = { [key: string]: ((value: string) => void)[] };
const callbacks: ListenCallback = {};
const clientPush = new Redis();
clientPush.on('error', function (err) {
  console.log('REDIS ERROR', err);
});
const clientListen = new Redis();
clientListen.on('error', function (err) {
  console.log('REDIS ERROR', err);
});

interface IRedisListenServiceConfig {
  channels: string[];
}

interface IRedisListenService extends IService {
  push<T>(key: string, value: T): Promise<void>;

  listen<T>(key: string, handler: (value: T) => Promise<void>): void;
}

const RedisListenService: IRedisListenService = {
  start: async function (config?: IRedisListenServiceConfig) {
    const channels = (config?.channels || []).map(
      (it) => process.env.REDIS_CHANNEL + it
    );
    if (!channels.length) return;
    async function listen() {
      return new Promise((resolve, reject) => {
        try {
          clientListen.brpop(
            channels,
            0,
            (
              err?: Error | null,
              result?: [key: string, value: string] | null
            ) => {
              if (!result) return resolve(false);
              const [key, value] = result;
              for (const callback of callbacks[key] || []) {
                callback(value);
              }
              resolve(true);
            }
          );
        } catch (e) {
          console.log(e);
          setTimeout(() => {
            resolve(false);
          }, 2000);
        }
      });
    }

    {
      // noinspection InfiniteLoopJS
      // eslint-disable-next-line no-constant-condition
      while (true) {
        await listen();
      }
    }
  },

  stop: async function () {
    await clientListen.disconnect();
  },

  push: async function <T>(channel: string, value: T): Promise<void> {
    try {
      let saveValue: string | null = null;
      switch (typeof value) {
        case 'object':
          saveValue = JSON.stringify(value);
          break;
        case 'string':
          saveValue = value;
          break;
      }
      if (saveValue) {
        await clientPush.lpush(process.env.REDIS_CHANNEL + channel, saveValue);
      }
    } catch (e) {
      console.log('REDIS ERROR', e);
    }
  },
  listen: async function <T>(
    key: string,
    handler: (value: T) => Promise<void>
  ) {
    key = process.env.REDIS_CHANNEL + key;
    if (!callbacks[key]) callbacks[key] = [];
    callbacks[key].push((value: string) => {
      handler(<T>JSON.parse(value));
    });
  }
};

export default RedisListenService;
