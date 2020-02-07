import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../helpers/database.helper';
import { createTestApplicationContext } from '../helpers/context.helper';
import { ProviderService } from '../../services';
import { Provider } from '../../models';

describe('ProviderService', () => {
  let providerService: ProviderService;

  before('getProviderService', async () => {
    const testApplicationContext = createTestApplicationContext();
    providerService = testApplicationContext.providerService;
  });

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all providers', async () => {
    const providers = await providerService.getAll();
    expect(providers.length).to.equal(2);
  });

  it('gets a provider', async () => {
    const provider = await providerService.getById(1);

    expect(provider || null).to.not.be.null();
    expect(provider.name).to.equal('provider 1');
  });

  it('saves a provider', async () => {
    const providers = await providerService.getAll();
    expect(providers.length).to.equal(3);

    const provider = new Provider({
      name: 'provider 3',
      description: 'A new provider',
      url: 'http://localhost:4002/api/v1'
    });
    await providerService.save(provider);
    expect(provider.id || null).to.not.be.null();

    const persistedProvider = await providerService.getById(provider.id);
    expect(persistedProvider || null).to.not.be.null();
  });

  it('deletes a provider', async () => {
    let providers = await providerService.getAll();

    const provider = providers.find(aProvider => aProvider.id === 2);

    await providerService.delete(provider);

    providers = await providerService.getAll();
    expect(providers.length).to.equal(1);
  });

  it('updates a provider', async () => {
    const providers = await providerService.getAll();

    const provider = providers[0];
    provider.name = 'A new name';

    const persistedProvider = await providerService.save(provider);
    expect(persistedProvider || null).to.not.be.null();
    expect(persistedProvider.id).to.equal(provider.id);
    expect(persistedProvider.name).to.equal(provider.name);

    const providersAfterUpdate = await providerService.getAll();
    expect(providersAfterUpdate.length).to.equal(providers.length);
  });
});
