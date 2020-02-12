import { CloudServiceApplication } from '../..';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';
import { TypeORMDataSource } from '../../datasources';
import { CloudProviderMockServer, cloudProviderMockServers } from '../mock/cloud-provider-mock.server';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  // Get mock servers
  const cloudProviderServers = cloudProviderMockServers();

  const app = new CloudServiceApplication({
    rest: restConfig,
    ignoreDotenv: true
  });

  await app.boot();
  await app.start();
  const datasource: TypeORMDataSource = await app.get('datasources.typeorm');

  const client = createRestAppClient(app);

  return { app, client, datasource, cloudProviderServers };
}

export interface AppWithClient {
  app: CloudServiceApplication;
  client: Client;
  datasource: TypeORMDataSource;
  cloudProviderServers: CloudProviderMockServer[]
}
