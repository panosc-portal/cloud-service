import { Client, expect } from '@loopback/testlab';
import { CloudServiceApplication } from '../..';
import { setupApplication } from '../helpers/application.helper';
import { CloudProviderMockServer, stopCloudProviderMockServers, startCloudProviderMockServers } from '../mock/cloud-provider-mock.server';
import { ProviderDto } from '../../controllers/dto/provider-dto.model';
import { givenInitialisedDatabase } from '../helpers/database.helper';
import { TypeORMDataSource } from '../../datasources';
import { CloudImage, CloudFlavour } from '../../models';
import { PlanDto } from '../../controllers/dto/plan-dto.model';

describe('ProviderController', () => {
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

  it('invokes GET /api/providers', async () => {
    const res = await client.get('/api/providers').expect(200);

    const providers = res.body as ProviderDto[];
    expect(providers.length).to.equal(3);
    expect(providers[0].id).to.equal(1);
    expect(providers[0].name).to.equal('provider 1');
    expect(providers[0].url).to.equal('http://localhost:5000/api');
  });

  it('invokes GET /api/providers/{:id}', async () => {
    const res = await client.get('/api/providers/1').expect(200);

    const provider = res.body as ProviderDto;
    expect(provider || null).to.not.be.null();
    expect(provider.id).to.equal(1);
    expect(provider.name).to.equal('provider 1');
    expect(provider.url).to.equal('http://localhost:5000/api');
  });

  it('invokes POST /api/providers', async () => {
    const initRes = await client.get('/api/providers').expect(200);
    const initProviders = initRes.body as ProviderDto[];

    const providerData = {
      name: 'new provider',
      description: 'A new provider',
      url: 'http://localhost:4003/api'
    }

    const res1 = await client.post('/api/providers').send(providerData).expect(200);

    const provider = res1.body as ProviderDto;
    expect(provider || null).to.not.be.null();
    expect(provider.id || null).to.not.be.null();

    const res2 = await client.get('/api/providers').expect(200);

    const providers = res2.body as ProviderDto[];
    expect(providers.length).to.equal(initProviders.length + 1);

    const res3 = await client.get(`/api/providers/${provider.id}`).expect(200);

    const provider2 = res3.body as ProviderDto;
    expect(provider2 || null).to.not.be.null();
    expect(provider2.id).to.equal(provider.id);
    expect(provider2.name).to.equal(providerData.name);
    expect(provider2.description).to.equal(providerData.description);
    expect(provider2.url).to.equal(providerData.url);
  });

  it('invokes PUT /api/providers/{:id}', async () => {

    const res = await client.get('/api/providers/1').expect(200);
    const provider = res.body as ProviderDto;
    expect(provider || null).to.not.be.null();
    expect(provider.id).to.equal(1);

    const newName = 'a test';

    const res1 = await client.put(`/api/providers/${provider.id}`).send({
      id: provider.id,
      name: newName,
      description: provider.description,
      url: provider.url
    }).expect(200);
    const returnedProvider = res1.body as ProviderDto;
    expect(returnedProvider || null).to.not.be.null();
    expect(returnedProvider.id).to.equal(provider.id);

    const res2 = await client.get(`/api/providers/${provider.id}`).expect(200);
    const provider2 = res2.body as ProviderDto;
    expect(provider2 || null).to.not.be.null();
    expect(provider2.id).to.equal(provider.id);
    expect(provider2.name).to.equal(newName);
  });

  it('invokes DEL /api/providers/{:id}', async () => {
    const initRes = await client.get('/api/providers').expect(200);
    const initProviders = initRes.body as ProviderDto[];

    const res = await client.delete('/api/providers/3').expect(200);
    const ok = res.body;
    expect(ok || null).to.not.be.null();
    expect(ok).to.equal(true);

    const finalRes = await client.get('/api/providers').expect(200);
    const finalProviders = finalRes.body as ProviderDto[];
    expect(finalProviders.length).to.equal(initProviders.length - 1);
  });

  it('invokes GET /api/providers/{:id}/images', async () => {
    const res = await client.get('/api/providers/1/images').expect(200);

    const images = res.body as CloudImage[];
    expect(images.length).to.equal(2);
    expect(images[0].id).to.equal(1);
    expect(images[0].name).to.equal('image 1.1');
    expect(images[0].protocols.length).to.equal(2);
  });

  it('invokes GET /api/providers/{:id}/images/{:imageId}/plans', async () => {
    const res = await client.get('/api/providers/1/images/1/plans').expect(200);

    const plans = res.body as PlanDto[];
    expect(plans.length).to.equal(2);
    expect(plans[0].id).to.equal(1);
    expect(plans[0].provider.id).to.equal(1);
    expect(plans[0].image.id).to.equal(1);
    expect(plans[0].flavour.id).to.equal(1);
  });

  it('invokes GET /api/providers/{:id}/flavours', async () => {
    const res = await client.get('/api/providers/1/flavours').expect(200);

    const flavours = res.body as CloudFlavour[];
    expect(flavours.length).to.equal(3);
    expect(flavours[0].id).to.equal(1);
    expect(flavours[0].name).to.equal('small');
    expect(flavours[0].cpu).to.equal(1);
    expect(flavours[0].memory).to.equal(1024);
  });

});
