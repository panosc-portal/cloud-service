import { Client, expect } from '@loopback/testlab';
import { CloudServiceApplication } from '../..';
import { setupApplication } from '../helpers/application.helper';
import { givenInitialisedDatabase } from '../helpers/database.helper';
import { TypeORMDataSource } from '../../datasources';
import { Health } from '../../models';

describe('HealthController', () => {
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
    await Promise.all([
      givenInitialisedDatabase(datasource),
    ]);
  });

  it('invokes GET /api/v1/health', async () => {
    const res = await client.get('/api/v1/health').expect(200);
    const health = res.body as Health;
    expect(health).to.equal(Health.UP);
  });

});
