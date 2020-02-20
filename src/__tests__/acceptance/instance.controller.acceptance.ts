import { Client, expect } from '@loopback/testlab';
import { CloudServiceApplication } from '../..';
import { setupApplication } from '../helpers/application.helper';
import { CloudProviderMockServer, stopCloudProviderMockServers, startCloudProviderMockServers } from '../mock/cloud-provider-mock.server';
import { InstanceDto } from '../../controllers/dto/instance-dto.model';
import { givenInitialisedDatabase } from '../helpers/database.helper';
import { TypeORMDataSource } from '../../datasources';
import { InstanceCreatorDto } from '../../controllers/dto';
import { CloudInstanceUser, InstanceMemberRole, CloudInstanceState, CloudInstanceNetwork, CloudInstanceCommand, CloudInstanceCommandType } from '../../models';
import { InstanceUpdatorDto } from '../../controllers/dto/instance-updator-dto.model';

describe('InstanceController', () => {
  let app: CloudServiceApplication;
  let client: Client;
  let cloudProviderServers: CloudProviderMockServer[];
  let datasource: TypeORMDataSource;

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

  it('invokes GET /api/v1/instances', async () => {
    const res = await client.get('/api/v1/instances').expect(200);

    const instances = res.body as InstanceDto[];
    expect(instances.length).to.equal(9);

    const cloudInstance = instances[0];
    expect(cloudInstance.id).to.equal(9);
    expect(cloudInstance.cloudId).to.equal(3);
    expect(cloudInstance.plan || null).to.not.be.null();
    expect(cloudInstance.plan.id).to.equal(5);
    expect(cloudInstance.image || null).to.not.be.null();
    expect(cloudInstance.image.id).to.equal(1);
    expect(cloudInstance.flavour || null).to.not.be.null();
    expect(cloudInstance.flavour.id).to.equal(1);
  });

  it('invokes GET /api/v1/instances/{:id}', async () => {
    const res = await client.get('/api/v1/instances/1').expect(200);

    const cloudInstance = res.body as InstanceDto;
    expect(cloudInstance || null).to.not.be.null();

    expect(cloudInstance.id).to.equal(1);
    expect(cloudInstance.cloudId).to.equal(1);
    expect(cloudInstance.plan || null).to.not.be.null();
    expect(cloudInstance.plan.id).to.equal(1);
    expect(cloudInstance.image || null).to.not.be.null();
    expect(cloudInstance.image.id).to.equal(1);
    expect(cloudInstance.flavour || null).to.not.be.null();
    expect(cloudInstance.flavour.id).to.equal(1);
  });


  it('invokes POST /api/v1/instances', async () => {
    const initRes = await client.get('/api/v1/instances').expect(200);
    const initInstances = initRes.body as InstanceDto[];

    const instanceData = new InstanceCreatorDto({
      name: 'new instance',
      description: 'A new instance',
      planId: 6,
      user: new CloudInstanceUser({
        accountId: 1000,
        firstName: 'jo',
        lastName: 'juja',
        homePath: '/home/jojuja',
        uid: 1,
        gid: 2,
        username: 'jojuja'
      }),
    });

    const res1 = await client.post('/api/v1/instances').send(instanceData).expect(200);

    const instance = res1.body as InstanceDto;
    expect(instance || null).to.not.be.null();
    expect(instance.id || null).to.not.be.null();

    const res2 = await client.get('/api/v1/instances').expect(200);

    const instances = res2.body as InstanceDto[];
    expect(instances.length).to.equal(initInstances.length + 1);

    const res3 = await client.get(`/api/v1/instances/${instance.id}`).expect(200);

    const instance2 = res3.body as InstanceDto;
    expect(instance2 || null).to.not.be.null();
    expect(instance2.id).to.equal(instance.id);
    expect(instance2.plan || null).to.not.be.null();
    expect(instance2.plan.id).to.equal(6);
    expect(instance2.plan.provider || null).to.not.be.null();
    expect(instance2.plan.provider.id).to.equal(2);
    expect(instance2.image || null).to.not.be.null();
    expect(instance2.image.id).to.equal(1);
    expect(instance2.flavour || null).to.not.be.null();
    expect(instance2.flavour.id).to.equal(2);
    expect(instance2.state || null).to.not.be.null();
    expect(instance2.members || null).to.not.be.null();
    expect(instance2.members.length).to.equal(1);
    expect(instance2.members[0].user.id).to.equal(instanceData.user.accountId);
    expect(instance2.members[0].role).to.equal(InstanceMemberRole.OWNER);
  });

  it('invokes PUT /api/v1/instances/{:id}', async () => {

    const res = await client.get('/api/v1/instances/1').expect(200);
    const instance = res.body as InstanceDto;
    expect(instance || null).to.not.be.null();
    expect(instance.id).to.equal(1);

    const newName = 'a test';
    const newDescripion = 'a test to test';

    const res1 = await client.put(`/api/v1/instances/${instance.id}`).send(new InstanceUpdatorDto({
      id: instance.id,
      name: newName,
      description: newDescripion,
    })).expect(200);
    const returnedInstance = res1.body as InstanceDto;
    expect(returnedInstance || null).to.not.be.null();
    expect(returnedInstance.id).to.equal(instance.id);

    const res2 = await client.get(`/api/v1/instances/${instance.id}`).expect(200);
    const instance2 = res2.body as InstanceDto;
    expect(instance2 || null).to.not.be.null();
    expect(instance2.id).to.equal(instance.id);
    expect(instance2.name).to.equal(newName);
    expect(instance2.description).to.equal(newDescripion);
  });

  it('invokes DEL /api/v1/instances/{:id}', async () => {

    const initRes = await client.get('/api/v1/instances').expect(200);
    const initInstances = initRes.body as InstanceDto[];

    const res = await client.delete('/api/v1/instances/1').expect(200);
    const ok = res.body;
    expect(ok || null).to.not.be.null();
    expect(ok).to.equal(true);

    const finalRes = await client.get('/api/v1/instances').expect(200);
    const finalInstances = finalRes.body as InstanceDto[];
    expect(finalInstances.length).to.equal(initInstances.length - 1);
  });

  it('invokes GET /api/v1/instances/{:id}/state', async () => {
    const res = await client.get('/api/v1/instances/1/state').expect(200);

    const cloudInstanceState = res.body as CloudInstanceState;
    expect(cloudInstanceState || null).to.not.be.null();
    expect(cloudInstanceState.status).to.equal('BUILDING');
    expect(cloudInstanceState.cpu).to.equal(1);
    expect(cloudInstanceState.memory).to.equal(1024);
  });

  it('invokes GET /api/v1/instances/{:id}/network', async () => {
    const res = await client.get('/api/v1/instances/1/network').expect(200);

    const cloudInstanceNetwork = res.body as CloudInstanceNetwork;
    expect(cloudInstanceNetwork || null).to.not.be.null();
    expect(cloudInstanceNetwork.hostname).to.equal('instance1.host.eu');
    expect(cloudInstanceNetwork.protocols.length).to.equal(2);
    expect(cloudInstanceNetwork.protocols[0].name).to.equal('RDP');
    expect(cloudInstanceNetwork.protocols[1].name).to.equal('GUACD');
  });

  it('invokes POST /api/v1/instances/{:id}/actions', async () => {
    const command = new CloudInstanceCommand({type: CloudInstanceCommandType.REBOOT});
    const res = await client.post('/api/v1/users/1/instances/1/actions').send(command).expect(200);

    const instance = res.body as InstanceDto;
    expect(instance || null).to.not.be.null();
    expect(instance.id).to.equal(1);
    expect(instance.state.status).to.equal('REBOOTING');
  });

  // it('invokes POST /api/v1/instances/{:id}/token', async () => {
  // });

  // it('invokes GET /instances/{instanceId}/token/{token]/validate', async () => {
  // });

});
