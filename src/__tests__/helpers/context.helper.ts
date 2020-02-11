import { testDataSource } from '../fixtures/datasources/testdb.datasource';
import { ProviderRepository, PlanRepository } from '../../repositories';
import { ProviderService, PlanService } from '../../services';

export interface TestApplicationContext {
  providerRepository: ProviderRepository;
  providerService: ProviderService;
  planRepository: PlanRepository;
  planService: PlanService;
}

export function createTestApplicationContext(): TestApplicationContext {
  const providerRepository: ProviderRepository = new ProviderRepository(testDataSource);
  const providerService: ProviderService = new ProviderService(providerRepository);
  const planRepository: PlanRepository = new PlanRepository(testDataSource);
  const planService: PlanService = new PlanService(planRepository);

  return {
    providerRepository,
    providerService,
    planRepository,
    planService
  };
}
