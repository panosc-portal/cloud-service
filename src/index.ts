import * as dotenv from 'dotenv';
import { CloudServiceApplication } from './application';
import { ApplicationConfig } from '@loopback/core';
dotenv.config();
import { logger } from './utils';

export { CloudServiceApplication };

export async function main(options: ApplicationConfig = {}) {
  const app = new CloudServiceApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  logger.info(`Server is running at ${url}`);

  return app;
}
