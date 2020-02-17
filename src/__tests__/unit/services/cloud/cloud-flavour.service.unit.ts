import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../../helpers/context.helper';
import { CloudProviderMockServer, cloudProviderMockServers, startCloudProviderMockServers, stopCloudProviderMockServers } from '../../../mock/cloud-provider-mock.server';

describe('CloudFlavourService', () => {
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

  it('gets all cloudFlavours', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudFlavours = await context.cloudFlavourService.getAll(provider);
    expect(cloudFlavours.length).to.equal(3);
  });

  it('gets a cloudFlavour', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudFlavour = await context.cloudFlavourService.getById(1, provider);

    expect(cloudFlavour || null).to.not.be.null();
    expect(cloudFlavour.name).to.equal('small');
    expect(cloudFlavour.cpu).to.equal(1);
    expect(cloudFlavour.memory).to.equal(1024);
  });
});
