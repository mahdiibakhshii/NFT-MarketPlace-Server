import IService from '../IService';
import Redis from 'ioredis';

const client = new Redis();
client.on('error', function (err) {
  console.log('REDIS ERROR', err);
});

interface IRedisService extends IService {
  saveObject(key: string, value: any, age: number): void;

  getObject<T>(key: string): Promise<T | null>;
}

const RedisService: IRedisService = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  start: async function () {},

  stop: async function () {
    await client.disconnect();
  },

  saveObject: async function (key: string, value: any, age: number) {
    try {
      await client.set(
        process.env.REDIS_PREFIX + key,
        JSON.stringify(value),
        'EX',
        age
      );
    } catch (e) {
      console.log('REDIS ERROR', e);
    }
  },

  getObject: async function <T>(key: string): Promise<T | null> {
    try {
      const str = await client.get(process.env.REDIS_PREFIX + key);
      if (!str) return null;
      return <T>JSON.parse(str);
    } catch (e) {
      console.log('REDIS ERROR', e);
      return null;
    }
  }
};

export default RedisService;
