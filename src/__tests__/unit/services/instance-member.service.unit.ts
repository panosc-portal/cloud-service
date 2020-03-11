import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';
import { InstanceMember, InstanceMemberRole } from '../../../models';

describe('InstanceMemberService', () => {
  let context: TestApplicationContext;

  before('get context', async () => {
    context = createTestApplicationContext();
  });

  after('close db connect', closeTestDatabase);

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all instanceMembers', async () => {
    const instanceMembers = await context.instanceMemberService.getAll();
    expect(instanceMembers.length).to.equal(5);
  });

  it('gets a instanceMember', async () => {
    const instanceMember = await context.instanceMemberService.getById(1);

    expect(instanceMember || null).to.not.be.null();
    expect(instanceMember.user.id).to.equal(1);
    expect(instanceMember.instance || null).to.be.null();
    expect(instanceMember.instanceId || null).to.not.be.null();
    expect(instanceMember.instanceId || null).to.equal(1);
    expect(instanceMember.role).to.equal('OWNER');
  });

  it('gets a instanceMember for the owner of an instance', async () => {
    const instanceMember = await context.instanceMemberService.getForOwnerOfInstanceId(3);

    expect(instanceMember || null).to.not.be.null();
    expect(instanceMember.id).to.equal(5);
    expect(instanceMember.user.id).to.equal(1);
    expect(instanceMember.instance || null).to.be.null();
    expect(instanceMember.instanceId || null).to.not.be.null();
    expect(instanceMember.instanceId || null).to.equal(3);
    expect(instanceMember.role).to.equal('OWNER');
  });

  it('gets a instanceMember instance', async () => {
    const instanceMember = await context.instanceMemberService.getById(1);
    const instance = await context.instanceMemberService.getInstanceForInstanceMember(instanceMember);

    expect(instance || null).to.not.be.null();
    expect(instance.id).to.equal(1);
  });

  it('saves a instanceMember', async () => {
    const instanceMembers = await context.instanceMemberService.getAll();
    const instanceMemberCount = instanceMembers.length;

    const user = await context.userService.getById(1);
    const instance = await context.instanceService.getById(1);

    const instanceMember = new InstanceMember({
      user: user,
      instance: instance,
      role: InstanceMemberRole.GUEST,
    });
    await context.instanceMemberService.save(instanceMember);
    expect(instanceMember.id || null).to.not.be.null();

    const persistedInstanceMember = await context.instanceMemberService.getById(instanceMember.id);
    expect(persistedInstanceMember || null).to.not.be.null();

    const instanceMembers2 = await context.instanceMemberService.getAll();
    expect(instanceMembers2.length).to.equal(instanceMemberCount + 1);
  });

  it('deletes a instanceMember', async () => {
    let instanceMembers = await context.instanceMemberService.getAll();
    const instanceMemberCount = instanceMembers.length;

    const instanceMember = instanceMembers.find(aInstanceMember => aInstanceMember.id === 5);

    await context.instanceMemberService.delete(instanceMember);

    instanceMembers = await context.instanceMemberService.getAll();
    expect(instanceMembers.length).to.equal(instanceMemberCount - 1);
  });

});
