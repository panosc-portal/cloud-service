import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';
import { Instance } from '../../../models';

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

  it('deletes an instance', async () => {
    let instances = await context.instanceService.getAll();
    const instanceCount = instances.length;

    const instance = instances.find(aInstance => aInstance.id === 9);

    await context.instanceService.delete(instance);

    instances = await context.instanceService.getAll();
    expect(instances.length).to.equal(instanceCount - 1);
  });

});
