import dotenv from 'dotenv';
import mongoUnit from 'mongo-unit';
import MongoService from '../src/services/mongo/mongoService.js';
import RedisService from '../src/services/redis/redisService.js';
import RedisListenService from '../src/services/redis/redisListenService.js';

export async function prepareNow() {
  dotenv.config({
    path: '.env_test'
  });
  const testMongoURI = await mongoUnit.start();
  process.env.DB_URI = testMongoURI + 'test';
  console.log(`Fake MongoDB on: ${testMongoURI}`);
  await MongoService.start();
  console.log('Connect to fake mongoDB!');
  RedisService.start();
  RedisListenService.start();
  console.log('Redis connections established.');
}

export async function afterNow() {
  await MongoService.stop();
  console.log('Disconnected from mongoDB!');
  await mongoUnit.stop();
  console.log('Fake mongoDB stopped.');
}
