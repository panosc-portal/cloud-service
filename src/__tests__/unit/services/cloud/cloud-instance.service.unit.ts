import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../../helpers/context.helper';
import { CloudProviderMockServer, cloudProviderMockServers, startCloudProviderMockServers, stopCloudProviderMockServers } from '../../../mock/cloud-provider-mock.server';
import { CloudInstanceCreatorDto, CloudInstanceUpdatorDto } from '../../../../services';
import { CloudInstanceUser, CloudInstanceCommand, CloudInstanceCommandType } from '../../../../models';

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

  it('creates a cloudInstance', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudInstanceCreatorDto = new CloudInstanceCreatorDto({
      name: 'test',
      description: 'a test instance',
      imageId: 1,
      flavourId: 1,
      user: new CloudInstanceUser({
        accountId: 1000,
        firstName: 'jane',
        lastName: 'doe',
        uid: 1001,
        gid: 1002,
        homePath: '/home/doe',
        username: 'janedoe'
      })
    });

    const cloudInstance = await context.cloudInstanceService.save(cloudInstanceCreatorDto, provider);

    expect(cloudInstance || null).to.not.be.null();
    expect(cloudInstance.name).to.equal(cloudInstanceCreatorDto.name);
    expect(cloudInstance.protocols.length).to.equal(2);
    expect(cloudInstance.protocols[0].name).to.equal('RDP');
    expect(cloudInstance.protocols[1].name).to.equal('GUACD');
    expect(cloudInstance.image || null).to.not.be.null();
    expect(cloudInstance.image.id).to.equal(1);
    expect(cloudInstance.flavour || null).to.not.be.null();
    expect(cloudInstance.flavour.id).to.equal(1);

    const cloudInstances = await context.cloudInstanceService.getAll(provider);
    expect(cloudInstances.length).to.equal(7);
  });

  it('Updates a cloudInstance', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudInstance = await context.cloudInstanceService.getById(1, provider);

    const cloudInstanceUpdatorDto = new CloudInstanceUpdatorDto({
      id: cloudInstance.id,
      name: 'new_name',
      description: 'an instance witha a new name',
    });

    const updatedCloudInstance = await context.cloudInstanceService.update(cloudInstanceUpdatorDto, provider);
    expect(updatedCloudInstance || null).to.not.be.null();
    expect(updatedCloudInstance.name).to.equal(cloudInstanceUpdatorDto.name);
    expect(updatedCloudInstance.description).to.equal(cloudInstanceUpdatorDto.description);

    const cloudInstances = await context.cloudInstanceService.getAll(provider);
    expect(cloudInstances.length).to.equal(6);

    const cloudInstance2 = await context.cloudInstanceService.getById(1, provider);
    expect(cloudInstance2.name).to.equal(cloudInstanceUpdatorDto.name);
    expect(cloudInstance2.description).to.equal(cloudInstanceUpdatorDto.description);
  });

  it('Deletes a cloudInstance', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudInstances = await context.cloudInstanceService.getAll(provider);
    expect(cloudInstances.length).to.equal(6);

    const instance = cloudInstances[0];

    const didDelete = await context.cloudInstanceService.delete(instance.id, provider);
    expect(didDelete).to.be.true();

    const cloudInstances2 = await context.cloudInstanceService.getAll(provider);
    expect(cloudInstances2.length).to.equal(cloudInstances.length - 1);
  });

  it('gets a cloudInstance state', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudInstanceState = await context.cloudInstanceService.getStateById(1, provider);

    expect(cloudInstanceState || null).to.not.be.null();
    expect(cloudInstanceState.status).to.equal('BUILDING');
    expect(cloudInstanceState.cpu).to.equal(1);
    expect(cloudInstanceState.memory).to.equal(1024);
  });

  it('executes and action', async () => {
    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const cloudInstance = await context.cloudInstanceService.executeActionById(1, new CloudInstanceCommand({type: CloudInstanceCommandType.REBOOT}), provider);

    expect(cloudInstance || null).to.not.be.null();
    expect(cloudInstance.state.status).to.equal('REBOOTING');
  });

});
