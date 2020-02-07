import { testDataSource } from '../fixtures/datasources/testdb.datasource';
import { ProviderRepository } from '../../repositories';
import { ProviderService } from '../../services';

export interface TestApplicationContext {
  providerRepository: ProviderRepository;

  providerService: ProviderService;

}

export function createTestApplicationContext(): TestApplicationContext {
  const providerRepository: ProviderRepository = new ProviderRepository(testDataSource);
  const providerService: ProviderService = new ProviderService(providerRepository);

  return {
    providerRepository,
    providerService
  };
}
