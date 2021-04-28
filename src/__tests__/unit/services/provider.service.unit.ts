import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';
import { Provider } from '../../../models';

describe('ProviderService', () => {
  let context: TestApplicationContext;

  before('get context', async () => {
    context = createTestApplicationContext();
  });

  after('close db connect', closeTestDatabase);

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all providers', async () => {
    const providers = await context.providerService.getAll();
    expect(providers.length).to.equal(3);
  });

  it('gets a provider', async () => {
    const provider = await context.providerService.getById(1);

    expect(provider || null).to.not.be.null();
    expect(provider.name).to.equal('provider 1');
  });

  it('saves a provider', async () => {
    const providers = await context.providerService.getAll();
    const providerCount = providers.length;

    const provider = new Provider({
      name: 'provider 4',
      description: 'A new provider',
      url: 'http://localhost:4003/api'
    });
    await context.providerService.save(provider);
    expect(provider.id || null).to.not.be.null();

    const persistedProvider = await context.providerService.getById(provider.id);
    expect(persistedProvider || null).to.not.be.null();

    const providers2 = await context.providerService.getAll();
    expect(providers2.length).to.equal(providerCount + 1);
  });

  it('deletes a provider', async () => {
    let providers = await context.providerService.getAll();
    const providerCount = providers.length;

    const provider = providers.find(aProvider => aProvider.id === 3);

    await context.providerService.delete(provider);

    providers = await context.providerService.getAll();
    expect(providers.length).to.equal(providerCount - 1);
  });

  it('updates a provider', async () => {
    const providers = await context.providerService.getAll();

    const provider = providers[0];
    provider.name = 'A new name';

    const persistedProvider = await context.providerService.save(provider);
    expect(persistedProvider || null).to.not.be.null();
    expect(persistedProvider.id).to.equal(provider.id);
    expect(persistedProvider.name).to.equal(provider.name);

    const providersAfterUpdate = await context.providerService.getAll();
    expect(providersAfterUpdate.length).to.equal(providers.length);
  });
});
