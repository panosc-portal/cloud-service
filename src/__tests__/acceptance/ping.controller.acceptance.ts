import { Client, expect } from '@loopback/testlab';
import { CloudServiceApplication } from '../..';
import { setupApplication } from '../helpers/application.helper';
import { givenInitialisedDatabase } from '../helpers/database.helper';
import { TypeORMDataSource } from '../../datasources';

describe('PingController', () => {
  let app: CloudServiceApplication;
  let client: Client;
  let datasource: TypeORMDataSource;

  before('setup application', async () => {
    ({ app, client, datasource } = await setupApplication());
  });

  after('stop application', async () => {
    await app.stop();
  });

  beforeEach('Initialise Database', async () => {
    await givenInitialisedDatabase(datasource);
  });

  beforeEach('Initialise Database', async () => givenInitialisedDatabase(datasource));

  it('invokes GET /ping', async () => {
    const res = await client.get('/api/v1/ping?msg=world').expect(200);
    expect(res.body).to.containEql({ greeting: 'Hello from LoopBack' });
  });
});
