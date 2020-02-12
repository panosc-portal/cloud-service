import { Client, expect } from '@loopback/testlab';
import { CloudServiceApplication } from '../..';
import { setupApplication } from '../helpers/application.helper';
import { CloudProviderMockServer, stopCloudProviderMockServers, startCloudProviderMockServers } from '../mock/cloud-provider-mock.server';
import { givenInitialisedDatabase } from '../helpers/database.helper';
import { TypeORMDataSource } from '../../datasources';

describe('PingController', () => {
  let app: CloudServiceApplication;
  let client: Client;
  let datasource: TypeORMDataSource;
  let cloudProviderServers: CloudProviderMockServer[];

  before('setup application', async () => {
    ({ app, client, datasource, cloudProviderServers } = await setupApplication());
  });

  after('stop application', async () => {
    await app.stop();
  });

  beforeEach('Initialise Database and start mock servers', async () => {
    await Promise.all([
      givenInitialisedDatabase(datasource),
      startCloudProviderMockServers(cloudProviderServers)
    ]);
  });

  afterEach('Stop mock servers', async () => {
    await stopCloudProviderMockServers(cloudProviderServers);
  });

  beforeEach('Initialise Database', async () => givenInitialisedDatabase(datasource));

  it('invokes GET /ping', async () => {
    const res = await client.get('/api/v1/ping?msg=world').expect(200);
    expect(res.body).to.containEql({ greeting: 'Hello from LoopBack' });
  });
});
