import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../../helpers/context.helper';
import { CloudProviderMockServer, cloudProviderMockServers, startCloudProviderMockServers, stopCloudProviderMockServers } from '../../../mock/cloud-provider-mock.server';

describe('CloudInstanceService', () => {
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

  it('gets all cloudInstances', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudInstances = await context.cloudInstanceService.getAll(provider);
    expect(cloudInstances.length).to.equal(6);
  });

  it('gets a cloudInstance', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudInstance = await context.cloudInstanceService.getById(1, provider);

    expect(cloudInstance || null).to.not.be.null();
    expect(cloudInstance.name).to.equal('instance 1.1');
    expect(cloudInstance.protocols.length).to.equal(2);
    expect(cloudInstance.protocols[0].name).to.equal('RDP');
    expect(cloudInstance.protocols[1].name).to.equal('GUACD');
    expect(cloudInstance.image || null).to.not.be.null();
    expect(cloudInstance.image.id).to.equal(1);
    expect(cloudInstance.flavour || null).to.not.be.null();
    expect(cloudInstance.flavour.id).to.equal(1);
  });
});
