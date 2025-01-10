import cluster from 'cluster';
import { cpus } from 'os';
import dotenv from 'dotenv';
import MongoService from './services/mongo/mongoService.js';
import httpRouter from './routers/http/httpRouter.js';
import RedisService from './services/redis/redisService.js';
import ProviderService from './services/web3/ProviderService.js';

if (cluster.isPrimary || cluster.isMaster) {
  // Start workers
  const numCPUs = cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  try {
    dotenv.config();
    MongoService.start();
    RedisService.start();
    await ProviderService.start();
    // start the http service to provide application layer services
    httpRouter.start();
  } catch (e) {
    console.error('error in app.js :', e);
  }
}
