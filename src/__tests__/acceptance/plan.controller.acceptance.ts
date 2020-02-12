import { Client, expect } from '@loopback/testlab';
import { CloudServiceApplication } from '../..';
import { setupApplication } from '../helpers/application.helper';
import { CloudProviderMockServer, stopCloudProviderMockServers, startCloudProviderMockServers } from '../mock/cloud-provider-mock.server';
import { PlanDto } from '../../controllers/dto/plan-dto.model';
import { givenInitialisedDatabase } from '../helpers/database.helper';
import { TypeORMDataSource } from '../../datasources';

describe('PlanController', () => {
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

  it('invokes GET /api/v1/plans', async () => {
    const res = await client.get('/api/v1/plans').expect(200);

    const plans = res.body as PlanDto[];
    expect(plans.length).to.equal(6);
    expect(plans[0].id).to.equal(1);
    expect(plans[0].provider.id).to.equal(1);
    expect(plans[0].image.id).to.equal(1);
    expect(plans[0].flavour.id).to.equal(1);
  });

  it('invokes GET /api/v1/plans/{:id}', async () => {
    const res = await client.get('/api/v1/plans/1').expect(200);

    const plan = res.body as PlanDto;
    expect(plan || null).to.not.be.null();
    expect(plan.id).to.equal(1);
    expect(plan.provider.id).to.equal(1);
    expect(plan.image.id).to.equal(1);
    expect(plan.flavour.id).to.equal(1);
  });

  it('invokes POST /api/v1/plans', async () => {
    const planData = {
      name: 'new plan',
      description: 'A new plan',
      providerId: 2,
      imageId: 2,
      flavourId: 1
    }

    const res1 = await client.post('/api/v1/plans').send(planData).expect(200);

    const plan = res1.body as PlanDto;
    expect(plan || null).to.not.be.null();
    expect(plan.id || null).to.not.be.null();

    const res2 = await client.get('/api/v1/plans').expect(200);

    const plans = res2.body as PlanDto[];
    expect(plans.length).to.equal(7);

    const res3 = await client.get(`/api/v1/plans/${plan.id}`).expect(200);

    const plan2 = res3.body as PlanDto;
    expect(plan2 || null).to.not.be.null();
    expect(plan2.id).to.equal(plan.id);
    expect(plan2.provider.id).to.equal(2);
    expect(plan2.image.id).to.equal(2);
    expect(plan2.flavour.id).to.equal(1);
  });

  it('invokes PUT /api/v1/plans/{:id}', async () => {

    const res = await client.get('/api/v1/plans/1').expect(200);
    const plan = res.body as PlanDto;
    expect(plan || null).to.not.be.null();
    expect(plan.id).to.equal(1);

    const newName = 'a test';

    const res1 = await client.put(`/api/v1/plans/${plan.id}`).send({
      id: plan.id,
      name: newName,
      description: plan.description,
      providerId: plan.provider.id,
      imageId: plan.image.id,
      flavourId: plan.flavour.id
    }).expect(200);
    const returnedPlan = res1.body as PlanDto;
    expect(returnedPlan || null).to.not.be.null();
    expect(returnedPlan.id).to.equal(plan.id);

    const res2 = await client.get(`/api/v1/plans/${plan.id}`).expect(200);
    const plan2 = res2.body as PlanDto;
    expect(plan2 || null).to.not.be.null();
    expect(plan2.id).to.equal(plan.id);
    expect(plan2.name).to.equal(newName);
  });

  it('invokes DEL /api/v1/plans/{:id}', async () => {

    const initRes = await client.get('/api/v1/plans').expect(200);
    const initPlans = initRes.body as PlanDto[];

    const res = await client.delete('/api/v1/plans/1').expect(200);
    const ok = res.body;
    expect(ok || null).to.not.be.null();
    expect(ok).to.equal(true);

    const finalRes = await client.get('/api/v1/plans').expect(200);
    const finalPlans = finalRes.body as PlanDto[];
    expect(finalPlans.length).to.equal(initPlans.length - 1);

  });

});
