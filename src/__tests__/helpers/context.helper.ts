import { testDataSource } from '../fixtures/datasources/testdb.datasource';
import { ProviderRepository, PlanRepository, InstanceRepository, UserRepository, InstanceMemberRepository } from '../../repositories';
import { ProviderService, PlanService, InstanceService, UserService, InstanceMemberService } from '../../services';

export interface TestApplicationContext {
  providerRepository: ProviderRepository;
  providerService: ProviderService;
  planRepository: PlanRepository;
  planService: PlanService;
  instanceRepository: InstanceRepository;
  instanceService: InstanceService;
  userRepository: UserRepository;
  userService: UserService;
  instanceMemberRepository: InstanceMemberRepository;
  instanceMemberService: InstanceMemberService;
}

export function createTestApplicationContext(): TestApplicationContext {
  const providerRepository = new ProviderRepository(testDataSource);
  const providerService = new ProviderService(providerRepository);
  const planRepository = new PlanRepository(testDataSource);
  const planService = new PlanService(planRepository);
  const userRepository = new UserRepository(testDataSource);
  const userService = new UserService(userRepository);
  const instanceMemberRepository = new InstanceMemberRepository(testDataSource);
  const instanceMemberService = new InstanceMemberService(instanceMemberRepository);
  const instanceRepository = new InstanceRepository(testDataSource);
  const instanceService = new InstanceService(instanceRepository, instanceMemberService);

  return {
    providerRepository,
    providerService,
    planRepository,
    planService,
    instanceRepository,
    instanceService,
    userRepository,
    userService,
    instanceMemberRepository,
    instanceMemberService,
  };
}
