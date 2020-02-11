import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';

describe('PlanRepository', () => {
  let context: TestApplicationContext;

  before('get context', async () => {
    context = createTestApplicationContext();
  });

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all plans for a provider and image', async () => {
    const providerId = 1;
    const imageId = 1;

    const plans = await context.planRepository.getByProviderIdAndImageId(providerId, imageId);
    expect(plans.length).to.equal(2);
  });


});
