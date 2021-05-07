import { testDataSource } from '../fixtures/datasources/testdb.datasource';
import { ProviderRepository, PlanRepository, InstanceRepository, UserRepository, InstanceMemberRepository, AuthorisationTokenRepository } from '../../repositories';
import { ProviderService, PlanService, InstanceService, UserService, InstanceMemberService, CloudFlavourService, CloudApiClientService, CloudImageService, CloudInstanceService } from '../../services';
import { AuthorisationTokenService } from '../../services/authorisation-token.service';
import {ConsoleLogger} from '@panosc-portal/panosc-common-ts';

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
  authorisationTokenRepository: AuthorisationTokenRepository;
  authorisationTokenService: AuthorisationTokenService;
  cloudFlavourService: CloudFlavourService;
  cloudImageService: CloudImageService;
  cloudInstanceService: CloudInstanceService;
  logger: ConsoleLogger;
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
  const authorisationTokenRepository = new AuthorisationTokenRepository(testDataSource);
  const authorisationTokenService = new AuthorisationTokenService(authorisationTokenRepository, instanceMemberService);
  const logger = new ConsoleLogger(process.env.ACCOUNT_SERVICE_LOG_LEVEL);

  const cloudApiClientService = new CloudApiClientService();
  const cloudFlavourService = new CloudFlavourService(cloudApiClientService, logger);
  const cloudImageService = new CloudImageService(cloudApiClientService, logger);
  const cloudInstanceService = new CloudInstanceService(cloudApiClientService, logger);

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
    authorisationTokenRepository,
    authorisationTokenService,
    cloudFlavourService,
    cloudImageService,
    cloudInstanceService,
    logger
  };
}
