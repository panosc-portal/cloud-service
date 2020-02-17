import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../../helpers/context.helper';
import { CloudProviderMockServer, cloudProviderMockServers, startCloudProviderMockServers, stopCloudProviderMockServers } from '../../../mock/cloud-provider-mock.server';

describe('CloudImageService', () => {
  let context: TestApplicationContext;
  const cloudProviderServers: CloudProviderMockServer[] = cloudProviderMockServers();

  before('get context', async () => {
    context = createTestApplicationContext();
  });

  after('close db connect', closeTestDatabase);

  beforeEach('Initialise Database and start mock servers', async () => {
    await Promise.all([
      givenInitialisedTestDatabase(),
      startCloudProviderMockServers(cloudProviderServers),
    ]);
  });

  afterEach('Stop mock servers', async () => {
    await stopCloudProviderMockServers(cloudProviderServers);
  });

  it('gets all cloudImages', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudImages = await context.cloudImageService.getAll(provider);
    expect(cloudImages.length).to.equal(2);
  });

  it('gets a cloudImage', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudImage = await context.cloudImageService.getById(1, provider);

    expect(cloudImage || null).to.not.be.null();
    expect(cloudImage.name).to.equal('image 1.1');
    expect(cloudImage.protocols.length).to.equal(2);
    expect(cloudImage.protocols[0].name).to.equal('RDP');
    expect(cloudImage.protocols[1].name).to.equal('GUACD');
  });
});
