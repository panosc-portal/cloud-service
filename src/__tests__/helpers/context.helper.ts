import { testDataSource } from '../fixtures/datasources/testdb.datasource';
import { ProviderRepository, PlanRepository, InstanceRepository } from '../../repositories';
import { ProviderService, PlanService, InstanceService } from '../../services';

export interface TestApplicationContext {
  providerRepository: ProviderRepository;
  providerService: ProviderService;
  planRepository: PlanRepository;
  planService: PlanService;
  instanceRepository: InstanceRepository;
  instanceService: InstanceService;
}

export function createTestApplicationContext(): TestApplicationContext {
  const providerRepository: ProviderRepository = new ProviderRepository(testDataSource);
  const providerService: ProviderService = new ProviderService(providerRepository);
  const planRepository: PlanRepository = new PlanRepository(testDataSource);
  const planService: PlanService = new PlanService(planRepository);
  const instanceRepository: InstanceRepository = new InstanceRepository(testDataSource);
  const instanceService: InstanceService = new InstanceService(instanceRepository);

  return {
    providerRepository,
    providerService,
    planRepository,
    planService,
    instanceRepository,
    instanceService
  };
}
