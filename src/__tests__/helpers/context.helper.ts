import { testDataSource } from '../fixtures/datasources/testdb.datasource';
import { ProviderRepository, PlanRepository, InstanceRepository, UserRepository, InstanceMemberRepository } from '../../repositories';
import { ProviderService, PlanService, InstanceService, UserService, InstanceMemberService, CloudFlavourService, CloudApiClientService, CloudImageService, CloudInstanceService } from '../../services';

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
  cloudFlavourService: CloudFlavourService;
  cloudImageService: CloudImageService;
  cloudInstanceService: CloudInstanceService;
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

  const cloudApiClientService = new CloudApiClientService();
  const cloudFlavourService = new CloudFlavourService(cloudApiClientService);
  const cloudImageService = new CloudImageService(cloudApiClientService);
  const cloudInstanceService = new CloudInstanceService(cloudApiClientService);

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
    cloudFlavourService,
    cloudImageService,
    cloudInstanceService
  };
}
