import * as dotenv from 'dotenv';
import { CloudServiceApplication } from './application';
import { ApplicationConfig } from '@loopback/core';
dotenv.config();
import { PanoscCommonTsComponentBindings, ILogger} from '@panosc-portal/panosc-common-ts';

export { CloudServiceApplication };

export async function main(options: ApplicationConfig = {}) {
  const app = new CloudServiceApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;

  const logger: ILogger = await app.get<ILogger>(PanoscCommonTsComponentBindings.LOGGER);
  logger.info(`Server is running at ${url}`);

  return app;
}
