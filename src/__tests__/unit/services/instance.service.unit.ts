import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';
import { Instance, InstanceMemberRole, User } from '../../../models';

describe('InstanceService', () => {
  let context: TestApplicationContext;

  before('get context', async () => {
    context = createTestApplicationContext();
  });

  after('close db connect', closeTestDatabase);

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all instances', async () => {
    const instances = await context.instanceService.getAll();
    expect(instances.length).to.equal(9);
  });

  it('gets an instance', async () => {
    const instance = await context.instanceService.getById(1);

    expect(instance || null).to.not.be.null();
    expect(instance.plan || null).to.not.be.null();
    expect(instance.plan.id).to.equal(1);
    expect(instance.cloudId).to.equal(1);
    expect(instance.members || null).to.not.be.null();
    expect(instance.members.length).to.equal(3);
  });

  it('saves an instance', async () => {
    const instances = await context.instanceService.getAll();
    const instanceCount = instances.length;

    const plan = await context.planService.getById(1);
    expect(plan || null).to.not.be.null();

    const instance = new Instance({
      cloudId: 10,
      plan: plan
    });
    await context.instanceService.save(instance);
    expect(instance.id || null).to.not.be.null();

    const persistedInstance = await context.instanceService.getById(instance.id);
    expect(persistedInstance || null).to.not.be.null();
    expect(persistedInstance.deleted).to.equal(false);

    const instances2 = await context.instanceService.getAll();
    expect(instances2.length).to.equal(instanceCount + 1);
  });

  it('saves an instance with a member', async () => {
    const instances = await context.instanceService.getAll();
    const instanceCount = instances.length;

    const plan = await context.planService.getById(1);
    expect(plan || null).to.not.be.null();

    const user = await context.userService.getById(1);

    const instance = new Instance({
      cloudId: 10,
      plan: plan,
    });
    instance.addMember(user, InstanceMemberRole.OWNER);

    await context.instanceService.save(instance);
    expect(instance.id || null).to.not.be.null();

    const persistedInstance = await context.instanceService.getById(instance.id);
    expect(persistedInstance || null).to.not.be.null();
    expect(persistedInstance.deleted).to.equal(false);
    expect(persistedInstance.members || null).to.not.be.null();
    expect(persistedInstance.members.length).to.equal(1);
    expect(persistedInstance.members[0].user || null).to.not.be.null();
    expect(persistedInstance.members[0].user.id).to.equal(1);

    const instances2 = await context.instanceService.getAll();
    expect(instances2.length).to.equal(instanceCount + 1);
  });


  it('saves an instance with a new member', async () => {
    const instances = await context.instanceService.getAll();
    const instanceCount = instances.length;
    const users = await context.userService.getAll();
    const userCount = users.length;

    const plan = await context.planService.getById(1);
    expect(plan || null).to.not.be.null();

    const user = new User({
      id: 1000,
      email: 'bing@bangbong.me'
    });

    const instance = new Instance({
      cloudId: 10,
      plan: plan,
    });
    instance.addMember(user, InstanceMemberRole.OWNER);

    await context.instanceService.save(instance);
    expect(instance.id || null).to.not.be.null();

    const persistedInstance = await context.instanceService.getById(instance.id);
    expect(persistedInstance || null).to.not.be.null();
    expect(persistedInstance.deleted).to.equal(false);
    expect(persistedInstance.members || null).to.not.be.null();
    expect(persistedInstance.members.length).to.equal(1);
    expect(persistedInstance.members[0].user || null).to.not.be.null();
    expect(persistedInstance.members[0].user.id).to.equal(1000);

    const instances2 = await context.instanceService.getAll();
    expect(instances2.length).to.equal(instanceCount + 1);
    const users2 = await context.userService.getAll();
    expect(users2.length).to.equal(userCount + 1);

  });

  it('adds a member to an instance', async () => {
    const instance = await context.instanceService.getById(1);

    expect(instance || null).to.not.be.null();
    expect(instance.members.length).to.equal(3);

    const user = await context.userService.getById(4);
    instance.addMember(user, InstanceMemberRole.GUEST);

    await context.instanceService.save(instance);

    const instance2 = await context.instanceService.getById(1);

    expect(instance2 || null).to.not.be.null();
    expect(instance2.members.length).to.equal(4);
    expect(instance2.members.map(member => member.user.id).includes(4)).to.be.true();
  });

  it('does not add an existing member to an instance', async () => {
    const instance = await context.instanceService.getById(1);

    expect(instance || null).to.not.be.null();
    expect(instance.members.length).to.equal(3);

    const user = await context.userService.getById(1);
    instance.addMember(user, InstanceMemberRole.OWNER);
    expect(instance.members.length).to.equal(3);
  });


  it('removes a member from an instance', async () => {
    const instance = await context.instanceService.getById(1);

    const originalInstanceMembers = await context.instanceMemberService.getAll();

    expect(instance || null).to.not.be.null();
    expect(instance.members.length).to.equal(3);
    const member = instance.members[2];

    await context.instanceService.removeInstanceMember(instance, member);
    await context.instanceService.save(instance);

    const instance2 = await context.instanceService.getById(1);

    expect(instance2 || null).to.not.be.null();
    expect(instance2.members.length).to.equal(2);
    expect(instance2.members.map(aMember => aMember.user.id).includes(member.user.id)).to.be.false();

    const finalInstanceMembers = await context.instanceMemberService.getAll();
    expect(finalInstanceMembers.length).to.equal(originalInstanceMembers.length - 1);

  });

  it('deletes an instance', async () => {
    let instances = await context.instanceService.getAll();
    const instanceCount = instances.length;

    const instance = instances.find(aInstance => aInstance.id === 9);

    await context.instanceService.delete(instance);

    instances = await context.instanceService.getAll();
    expect(instances.length).to.equal(instanceCount - 1);
  });

  it('gets all instances for a user', async () => {
    const user = await context.userService.getById(1);
    expect(user || null).to.not.be.null();

    const instances = await context.instanceService.getAllForUser(user);
    expect(instances.length).to.equal(3);

    const instance = instances[2];
    expect(instance.id).to.equal(1);
    expect(instance.plan || null).to.not.be.null();
    expect(instance.plan.provider || null).to.not.be.null();
    expect(instance.members || null).to.not.be.null();
    expect(instance.members.length).to.equal(3);
  });
});
