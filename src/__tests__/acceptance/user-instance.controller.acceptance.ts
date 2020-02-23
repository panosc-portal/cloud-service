import { Client, expect } from '@loopback/testlab';
import { CloudServiceApplication } from '../..';
import { setupApplication } from '../helpers/application.helper';
import { CloudProviderMockServer, stopCloudProviderMockServers, startCloudProviderMockServers } from '../mock/cloud-provider-mock.server';
import { InstanceDto } from '../../controllers/dto/instance-dto.model';
import { givenInitialisedDatabase } from '../helpers/database.helper';
import { TypeORMDataSource } from '../../datasources';
import { InstanceCreatorDto, InstanceMemberCreatorDto, InstanceMemberUpdatorDto } from '../../controllers/dto';
import { CloudInstanceAccount, InstanceMemberRole, CloudInstanceState, CloudInstanceNetwork, CloudInstanceCommand, CloudInstanceCommandType, InstanceMember, User } from '../../models';
import { InstanceUpdatorDto } from '../../controllers/dto/instance-updator-dto.model';
import { AuthorisationTokenDto } from '../../controllers/dto/authorisation-token-dto.model';

describe('UserInstanceController', () => {
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

  it('invokes GET /api/v1/users/{:userId}/instances', async () => {
    const res = await client.get('/api/v1/users/1/instances').expect(200);

    const instances = res.body as InstanceDto[];
    expect(instances.length).to.equal(3);

    const cloudInstance = instances[0];
    expect(cloudInstance.id).to.equal(3);
    expect(cloudInstance.cloudId).to.equal(3);
    expect(cloudInstance.plan || null).to.not.be.null();
    expect(cloudInstance.plan.id).to.equal(3);
    expect(cloudInstance.image || null).to.not.be.null();
    expect(cloudInstance.image.id).to.equal(2);
    expect(cloudInstance.flavour || null).to.not.be.null();
    expect(cloudInstance.flavour.id).to.equal(1);
  });

  it('invokes GET /api/v1/users/{:userId}/instances/{:id}', async () => {
    const res = await client.get('/api/v1/users/1/instances/1').expect(200);

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

  it('fails to invoke GET /api/v1/users/{:userId}/instances/{:id} because user is not a member of the instance', async () => {
    await client.get('/api/v1/users/4/instances/1').expect(404);
  });

  it('invokes POST /api/v1/users/{:userId}/instances', async () => {
    const initRes = await client.get('/api/v1/users/1000/instances').expect(200);
    const initInstances = initRes.body as InstanceDto[];
    expect(initInstances.length).to.equal(0);

    const instanceData = new InstanceCreatorDto({
      name: 'new instance',
      description: 'A new instance',
      planId: 6,
      account: new CloudInstanceAccount({
        userId: 1000,
        firstName: 'jo',
        lastName: 'juja',
        homePath: '/home/jojuja',
        uid: 1,
        gid: 2,
        username: 'jojuja',
        email: 'jojuja@test.com'
      }),
    });

    const res1 = await client.post('/api/v1/users/1000/instances').send(instanceData).expect(200);

    const instance = res1.body as InstanceDto;
    expect(instance || null).to.not.be.null();
    expect(instance.id || null).to.not.be.null();

    const res2 = await client.get('/api/v1/users/1000/instances').expect(200);

    const instances = res2.body as InstanceDto[];
    expect(instances.length).to.equal(1);

    const res3 = await client.get(`/api/v1/users/1000/instances/${instance.id}`).expect(200);

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
    expect(instance2.members[0].user.id).to.equal(instanceData.account.userId);
    expect(instance2.members[0].role).to.equal(InstanceMemberRole.OWNER);
  });

  it('fails on invoking POST /api/v1/users/{:userId}/instances when userId not equal to instance.user.accountId', async () => {
    const instanceData = new InstanceCreatorDto({
      name: 'new instance',
      description: 'A new instance',
      planId: 6,
      account: new CloudInstanceAccount({
        userId: 1000,
        firstName: 'jo',
        lastName: 'juja',
        homePath: '/home/jojuja',
        uid: 1,
        gid: 2,
        username: 'jojuja',
        email: 'jojuja@test.com'
      }),
    });

    await client.post('/api/v1/users/1/instances').send(instanceData).expect(400);
  });

  it('invokes PUT /api/v1/users/{userId}/instances/{:id}', async () => {
    const res = await client.get('/api/v1/users/1/instances/1').expect(200);
    const instance = res.body as InstanceDto;
    expect(instance || null).to.not.be.null();
    expect(instance.id).to.equal(1);

    const newName = 'a test';
    const newDescripion = 'a test to test';

    const res1 = await client.put(`/api/v1/users/1/instances/${instance.id}`).send(new InstanceUpdatorDto({
      id: instance.id,
      name: newName,
      description: newDescripion,
    })).expect(200);
    const returnedInstance = res1.body as InstanceDto;
    expect(returnedInstance || null).to.not.be.null();
    expect(returnedInstance.id).to.equal(instance.id);

    const res2 = await client.get(`/api/v1/users/1/instances/${instance.id}`).expect(200);
    const instance2 = res2.body as InstanceDto;
    expect(instance2 || null).to.not.be.null();
    expect(instance2.id).to.equal(instance.id);
    expect(instance2.name).to.equal(newName);
    expect(instance2.description).to.equal(newDescripion);
  });

  it('fails to invoke PUT /api/v1/users/{userId}/instances/{:id} because user is not a member of the instance', async () => {
    const res = await client.get('/api/v1/users/1/instances/1').expect(200);
    const instance = res.body as InstanceDto;
    expect(instance || null).to.not.be.null();
    expect(instance.id).to.equal(1);

    const newName = 'a test';
    const newDescripion = 'a test to test';

    await client.put(`/api/v1/users/4/instances/${instance.id}`).send(new InstanceUpdatorDto({
      id: instance.id,
      name: newName,
      description: newDescripion,
    })).expect(404);
  });

  it('fails to invoke PUT /api/v1/users/{userId}/instances/{:id} because user is not the owner', async () => {
    const res = await client.get('/api/v1/users/1/instances/1').expect(200);
    const instance = res.body as InstanceDto;
    expect(instance || null).to.not.be.null();
    expect(instance.id).to.equal(1);

    const newName = 'a test';
    const newDescripion = 'a test to test';

    await client.put(`/api/v1/users/2/instances/${instance.id}`).send(new InstanceUpdatorDto({
      id: instance.id,
      name: newName,
      description: newDescripion,
    })).expect(401);
  });

  it('invokes DEL /api/v1/users/{userId}/instances/{:id}', async () => {
    const initRes = await client.get('/api/v1/users/1/instances').expect(200);
    const initInstances = initRes.body as InstanceDto[];

    const res = await client.delete('/api/v1/users/1/instances/1').expect(200);
    const ok = res.body;
    expect(ok || null).to.not.be.null();
    expect(ok).to.equal(true);

    const finalRes = await client.get('/api/v1/users/1/instances').expect(200);
    const finalInstances = finalRes.body as InstanceDto[];
    expect(finalInstances.length).to.equal(initInstances.length - 1);
  });

  it('fails to invoke DEL /api/v1/users/{userId}/instances/{:id} because user is not a member of the instance', async () => {
    await client.delete('/api/v1/users/4/instances/1').expect(404);
  });

  it('fails to invoke DEL /api/v1/users/{userId}/instances/{:id} because user is not the owner', async () => {
    await client.delete('/api/v1/users/2/instances/1').expect(401);
  });

  it('invokes GET /api/v1/users/{:userId}/instances/{:id}/state', async () => {
    const res = await client.get('/api/v1/users/1/instances/1/state').expect(200);

    const cloudInstanceState = res.body as CloudInstanceState;
    expect(cloudInstanceState || null).to.not.be.null();
    expect(cloudInstanceState.status).to.equal('BUILDING');
    expect(cloudInstanceState.cpu).to.equal(1);
    expect(cloudInstanceState.memory).to.equal(1024);
  });

  it('fails to invoke GET /api/v1/users/{:userId}/instances/{:id}/state because user is not a member of the instance', async () => {
    await client.get('/api/v1/users/4/instances/1/state').expect(404);
  });

  it('invokes GET /api/v1/users/{:userId}/instances/{:id}/network', async () => {
    const res = await client.get('/api/v1/users/1/instances/1/network').expect(200);

    const cloudInstanceNetwork = res.body as CloudInstanceNetwork;
    expect(cloudInstanceNetwork || null).to.not.be.null();
    expect(cloudInstanceNetwork.hostname).to.equal('instance1.host.eu');
    expect(cloudInstanceNetwork.protocols.length).to.equal(2);
    expect(cloudInstanceNetwork.protocols[0].name).to.equal('RDP');
    expect(cloudInstanceNetwork.protocols[1].name).to.equal('GUACD');
  });

  it('fails to invoke GET /api/v1/users/{:userId}/instances/{:id}/network because user is not a member of the instance', async () => {
    await client.get('/api/v1/users/4/instances/1/network').expect(404);
  });

  it('invokes POST /api/v1/users/{:userId}/instances/{:id}/actions', async () => {
    const command = new CloudInstanceCommand({type: CloudInstanceCommandType.REBOOT});
    const res = await client.post('/api/v1/users/1/instances/1/actions').send(command).expect(200);

    const instance = res.body as InstanceDto;
    expect(instance || null).to.not.be.null();
    expect(instance.id).to.equal(1);
    expect(instance.state.status).to.equal('REBOOTING');
  });

  it('fails to invoke POST /api/v1/users/{:userId}/instances/{:id}/actions because user is not a member of the instance', async () => {
    const command = new CloudInstanceCommand({type: CloudInstanceCommandType.REBOOT});
    await client.post('/api/v1/users/4/instances/1/actions').send(command).expect(404);
  });

  it('fails to invoke POST /api/v1/users/{:userId}/instances/{:id}/actions because user is not the owner', async () => {
    const command = new CloudInstanceCommand({type: CloudInstanceCommandType.REBOOT});
    await client.post('/api/v1/users/2/instances/1/actions').send(command).expect(401);
  });

  it('invokes POST /api/v1/users/{:userId}/instances/{:id}/token', async () => {
    const res = await client.post('/api/v1/users/1/instances/2/token').expect(200);
    const authorisationToken = res.body as AuthorisationTokenDto;
    expect(authorisationToken || null).to.not.be.null();
    expect(authorisationToken.token || null).to.not.be.null();
  });

  it('fails to invoke POST /api/v1/users/{:userId}/instances/{:id}/token if user is not member', async () => {
    await client.post('/api/v1/users/2/instances/2/token').expect(404);
  });

  it('invokes GET /api/v1/users/{:userId}/instances/{:id}/members', async () => {
    const res = await client.get('/api/v1/users/1/instances/1/members').expect(200);

    const members = res.body as InstanceMember[];
    expect(members || null).to.not.be.null();
    expect(members.length).to.equal(3);
  });

  it('fails to invoke GET /api/v1/users/{:userId}/instances/{:id}/members because user is not a member of the instance', async () => {
    await client.get('/api/v1/users/4/instances/1/members').expect(404);
  });

  it('invokes POST /api/v1/users/{:userId}/instances/{:id}/members', async () => {
    const listRes1 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members1 = listRes1.body as InstanceMember[];
    expect(members1 || null).to.not.be.null();

    const member = new InstanceMemberCreatorDto({
      role: InstanceMemberRole.USER,
      user: new User({
        id: 9999,
        firstName: 'Ben',
        lastName: 'Big',
        email: 'big.ben@london.eu'
      })
    })

    const res = await client.post('/api/v1/users/1/instances/1/members').send(member).expect(200);
    const createdMember = res.body as InstanceMember;
    expect(createdMember || null).to.not.be.null();
    expect(createdMember.id || null).to.not.be.null();

    const listRes2 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members2 = listRes2.body as InstanceMember[];
    expect(members2 || null).to.not.be.null();
    expect(members2.length).to.equal(members1.length + 1);
  });

  it('fails to invoke POST /api/v1/users/{:userId}/instances/{:id}/members because user is not a member of the instance', async () => {
    const member = new InstanceMemberCreatorDto({
      role: InstanceMemberRole.USER,
      user: new User({
        id: 9999,
        firstName: 'Ben',
        lastName: 'Big',
        email: 'big.ben@london.eu'
      })
    })

    await client.post('/api/v1/users/4/instances/1/members').send(member).expect(404);
  });

  it('fails to invoke POST /api/v1/users/{:userId}/instances/{:id}/members because user is not the owner', async () => {
    const member = new InstanceMemberCreatorDto({
      role: InstanceMemberRole.USER,
      user: new User({
        id: 9999,
        firstName: 'Ben',
        lastName: 'Big',
        email: 'big.ben@london.eu'
      })
    })

    await client.post('/api/v1/users/2/instances/1/members').send(member).expect(401);
  });

  it('fails to invoke POST /api/v1/users/{:userId}/instances/{:id}/members because role is owner', async () => {
    const member = new InstanceMemberCreatorDto({
      role: InstanceMemberRole.OWNER,
      user: new User({
        id: 9999,
        firstName: 'Ben',
        lastName: 'Big',
        email: 'big.ben@london.eu'
      })
    })

    await client.post('/api/v1/users/1/instances/1/members').send(member).expect(400);
  });

  it('invoke POST /api/v1/users/{:userId}/instances/{:id}/members with existing member', async () => {
    const listRes1 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members1 = listRes1.body as InstanceMember[];
    expect(members1 || null).to.not.be.null();

    const existingMember = members1.find(member => member.id === 2);

    const member = new InstanceMemberCreatorDto({
      role: existingMember.role,
      user: existingMember.user
    })

    const res = await client.post('/api/v1/users/1/instances/1/members').send(member).expect(200);
    const createdMember = res.body as InstanceMember;
    expect(createdMember || null).to.not.be.null();
    expect(createdMember.id || null).to.not.be.null();

    const listRes2 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members2 = listRes2.body as InstanceMember[];
    expect(members2 || null).to.not.be.null();
    expect(members2.length).to.equal(members1.length);
  });

  it('invokes PUT /api/v1/users/{:userId}/instances/{:id}/members/{:memberId}', async () => {
    const listRes1 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members1 = listRes1.body as InstanceMember[];
    expect(members1 || null).to.not.be.null();

    const existingMember = members1.find(member => member.id === 2);

    const memberUpdator = new InstanceMemberUpdatorDto({
      id: existingMember.id,
      role: InstanceMemberRole.GUEST
    });

    const res = await client.put(`/api/v1/users/1/instances/1/members/${existingMember.id}`).send(memberUpdator).expect(200);
    const updatedMember = res.body as InstanceMember;
    expect(updatedMember || null).to.not.be.null();

    const listRes2 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members2 = listRes2.body as InstanceMember[];
    expect(members2 || null).to.not.be.null();

    const updatedExistingMember = members2.find(member => member.id === 2);
    expect(updatedExistingMember.role).to.equal(InstanceMemberRole.GUEST);
  });

  it('fails to invoke PUT /api/v1/users/{:userId}/instances/{:id}/members/{:memberId} because user is not a member of the instance', async () => {
    const listRes1 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members = listRes1.body as InstanceMember[];
    const existingMember = members.find(member => member.id === 2);

    const memberUpdator = new InstanceMemberUpdatorDto({
      id: existingMember.id,
      role: InstanceMemberRole.GUEST
    });

    await client.put(`/api/v1/users/4/instances/1/members/${existingMember.id}`).send(memberUpdator).expect(404);
  });

  it('fails to invoke PUT /api/v1/users/{:userId}/instances/{:id}/members/{:memberId} because user is not the owner', async () => {
    const listRes1 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members = listRes1.body as InstanceMember[];
    const existingMember = members.find(member => member.id === 2);

    const memberUpdator = new InstanceMemberUpdatorDto({
      id: existingMember.id,
      role: InstanceMemberRole.GUEST
    });

    await client.put(`/api/v1/users/2/instances/1/members/${existingMember.id}`).send(memberUpdator).expect(401);
  });

  it('fails to invoke PUT /api/v1/users/{:userId}/instances/{:id}/members/{:memberId} because owner cannot change their role', async () => {
    const listRes1 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members = listRes1.body as InstanceMember[];
    const existingMember = members.find(member => member.id === 1);

    const memberUpdator = new InstanceMemberUpdatorDto({
      id: existingMember.id,
      role: InstanceMemberRole.GUEST
    });

    await client.put(`/api/v1/users/1/instances/1/members/${existingMember.id}`).send(memberUpdator).expect(400);
  });

  it('fails to invoke PUT /api/v1/users/{:userId}/instances/{:id}/members/{:memberId} because cannot have more than one owner', async () => {
    const listRes1 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members = listRes1.body as InstanceMember[];
    const existingMember = members.find(member => member.id === 2);

    const memberUpdator = new InstanceMemberUpdatorDto({
      id: existingMember.id,
      role: InstanceMemberRole.OWNER
    });

    await client.put(`/api/v1/users/1/instances/1/members/${existingMember.id}`).send(memberUpdator).expect(400);
  });

  it('invokes DELETE /api/v1/users/{:userId}/instances/{:id}/members/{:memberId}', async () => {
    const listRes1 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members1 = listRes1.body as InstanceMember[];
    const existingMember = members1.find(member => member.id === 3);

    const res = await client.delete(`/api/v1/users/1/instances/1/members/${existingMember.id}`).expect(200);
    const ok = res.body;
    expect(ok || null).to.not.be.null();
    expect(ok).to.equal(true);

    const listRes2 = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members2 = listRes2.body as InstanceMember[];
    expect(members2 || null).to.not.be.null();
    expect(members2.length).to.equal(members1.length - 1);
  });

  it('fails to invoke DELETE /api/v1/users/{:userId}/instances/{:id}/members/{:memberId} because user is not a member of the instance', async () => {
    const res = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members = res.body as InstanceMember[];
    const existingMember = members.find(member => member.id === 2);

    await client.delete(`/api/v1/users/4/instances/1/members/${existingMember.id}`).expect(404);
  });

  it('fails to invoke DELETE /api/v1/users/{:userId}/instances/{:id}/members/{:memberId} because user is not the owner', async () => {
    const res = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members = res.body as InstanceMember[];
    const existingMember = members.find(member => member.id === 2);

    await client.delete(`/api/v1/users/2/instances/1/members/${existingMember.id}`).expect(401);
  });

  it('fails to invoke DELETE /api/v1/users/{:userId}/instances/{:id}/members/{:memberId} because owner cannot be deleted', async () => {
    const res = await client.get('/api/v1/users/1/instances/1/members').expect(200);
    const members = res.body as InstanceMember[];
    const existingMember = members.find(member => member.id === 1);

    await client.delete(`/api/v1/users/1/instances/1/members/${existingMember.id}`).expect(400);
  });
});
