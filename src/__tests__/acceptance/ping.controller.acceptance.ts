import { Client, expect } from '@loopback/testlab';
import { CloudServiceApplication } from '../..';
import { setupApplication } from './test-helper';

describe('PingController', () => {
  let app: CloudServiceApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/api/v1/ping?msg=world').expect(200);
    expect(res.body).to.containEql({ greeting: 'Hello from LoopBack' });
  });
});
