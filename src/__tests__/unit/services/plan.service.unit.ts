import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';
import { Plan } from '../../../models';

describe('PlanService', () => {
  let context: TestApplicationContext;

  before('get context', async () => {
    context = createTestApplicationContext();
  });

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all plans', async () => {
    const plans = await context.planService.getAll();
    expect(plans.length).to.equal(6);
  });

  it('gets a plan', async () => {
    const plan = await context.planService.getById(1);

    expect(plan || null).to.not.be.null();
    expect(plan.name).to.equal('plan 1');
  });

  it('saves a plan', async () => {
    const plans = await context.planService.getAll();
    const planCount = plans.length;

    const provider = await context.providerService.getById(1);
    expect(provider || null).to.not.be.null();

    const plan = new Plan({
      name: 'plan 3',
      description: 'A new plan',
      provider: provider,
      imageId: 1,
      flavourId: 1
    });
    await context.planService.save(plan);
    expect(plan.id || null).to.not.be.null();

    const persistedPlan = await context.planService.getById(plan.id);
    expect(persistedPlan || null).to.not.be.null();

    const plans2 = await context.planService.getAll();
    expect(plans2.length).to.equal(planCount + 1);
  });

  it('deletes a plan', async () => {
    let plans = await context.planService.getAll();
    const planCount = plans.length;

    const plan = plans.find(aPlan => aPlan.id === 2);

    await context.planService.delete(plan);

    plans = await context.planService.getAll();
    expect(plans.length).to.equal(planCount - 1);
  });

  it('updates a plan', async () => {
    const plans = await context.planService.getAll();

    const plan = plans[0];
    plan.name = 'A new name';

    const persistedPlan = await context.planService.save(plan);
    expect(persistedPlan || null).to.not.be.null();
    expect(persistedPlan.id).to.equal(plan.id);
    expect(persistedPlan.name).to.equal(plan.name);

    const plansAfterUpdate = await context.planService.getAll();
    expect(plansAfterUpdate.length).to.equal(plans.length);
  });

});
