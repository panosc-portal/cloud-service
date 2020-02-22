import { Instance, CloudInstance, InstanceMemberRole, User, } from '../models';
import { inject } from '@loopback/context';
import { InstanceService, CloudFlavourService, CloudInstanceService, CloudInstanceCreatorDto, PlanService, CloudImageService, CloudInstanceUpdatorDto } from '../services';
import { BaseController } from './base.controller';
import { InstanceDto, InstanceCreatorDto, PlanDto, InstanceUpdatorDto } from './dto';

export class BaseInstanceController extends BaseController {
  constructor(
    protected _instanceService: InstanceService,
    protected _planService: PlanService,
    protected _cloudInstanceService: CloudInstanceService,
    cloudImageService: CloudImageService,
    cloudFlavourService: CloudFlavourService) {
    super(cloudImageService, cloudFlavourService);
  }

  protected async _convertInstances(instances: Instance[]): Promise<InstanceDto[]> {
    // Get all unique plans for the instances
    const plans = instances.map(instance => instance.plan).filter((plan, pos, array) => array.map(mapPlan => mapPlan.id).indexOf(plan.id) === pos);

    // Get all providers from the plans
    const providers = plans.map(plan => plan.provider).filter((provider, pos, array) => array.map(mapProvider => mapProvider.id).indexOf(provider.id) === pos);

    // Convert plans to DTOs and get cloud instances from all providers
    const [planDtos, allProviderInstances] = await Promise.all([
      this._convertPlans(plans),
      Promise.all(
        providers.map(async provider => {
          const cloudInstances = await this._cloudInstanceService.getAll(provider);

          return {
            provider: provider,
            instances: cloudInstances
          };
        })
      )
    ]);

    // Convert to map
    const providerInstances = allProviderInstances.reduce((map, obj) => map.set(obj.provider.id, obj.instances), new Map<number, CloudInstance[]>());

    const instanceDtos = instances.map(instance => {
      const cloudInstance = providerInstances.get(instance.plan.provider.id).find(aCloudInstance => aCloudInstance.id === instance.cloudId);
      const planDto = planDtos.find(aPlanDto => aPlanDto.id === instance.plan.id);

      return this._createInstanceDto(instance, cloudInstance, planDto);
    })

    return instanceDtos;
  }

  protected async _createInstance(instanceCreator: InstanceCreatorDto): Promise<InstanceDto> {
    const plan = await this._planService.getById(instanceCreator.planId);
    this.throwBadRequestIfNull(plan, 'Plan with given id does not exist');

    const provider = plan.provider;

    const cloudInstanceCreatorDto = new CloudInstanceCreatorDto({
      name: instanceCreator.name,
      description: instanceCreator.description,
      imageId: plan.imageId,
      flavourId: plan.flavourId,
      user: instanceCreator.user
    })

    const [cloudInstance, planDto] = await Promise.all([
      this._cloudInstanceService.save(cloudInstanceCreatorDto, provider),
      this._convertPlan(plan)
    ]);

    const instance = new Instance({
      cloudId: cloudInstance.id,
      plan: plan
    });
    const user = new User({
      id: instanceCreator.user.accountId,
      firstName: instanceCreator.user.firstName,
      lastName: instanceCreator.user.lastName,
      email: ''
    })
    instance.addMember(user, InstanceMemberRole.OWNER);

    const persistedInstance = await this._instanceService.save(instance);

    const instanceDto = this._createInstanceDto(persistedInstance, cloudInstance, planDto);
    return instanceDto;
  }

  protected async _updateInstance(instance: Instance, instanceUpdatorDto: InstanceUpdatorDto): Promise<InstanceDto> {
    const cloudInstanceUpdatorDto = new CloudInstanceUpdatorDto({
      id: instance.cloudId,
      name: instanceUpdatorDto.name,
      description: instanceUpdatorDto.description
    });

    const [cloudInstance, planDto] = await Promise.all([
      this._cloudInstanceService.update(cloudInstanceUpdatorDto, instance.plan.provider),
      this._convertPlan(instance.plan)
    ]);

    const instanceDto = this._createInstanceDto(instance, cloudInstance, planDto);
    return instanceDto;
  }

  protected async _deleteInstance(instanceId: number): Promise<boolean> {
    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    // Delete on cloud provider
    const cloudInstanceDeleted = await this._cloudInstanceService.delete(instance.cloudId, instance.plan.provider);

    if (cloudInstanceDeleted) {
      // (Soft) delete in local DB
      instance.deleted = cloudInstanceDeleted;

      const persistedInstance = await this._instanceService.save(instance);
      return persistedInstance.deleted;

    } else {
      return false;
    }
  }

  protected async _convertInstance(instance: Instance): Promise<InstanceDto> {

    // Get plan details and cloud instance from the provider
    const [planDto, cloudInstance] = await Promise.all([
      this._convertPlan(instance.plan),
      this._cloudInstanceService.getById(instance.cloudId, instance.plan.provider)
    ])

    const instanceDto = this._createInstanceDto(instance, cloudInstance, planDto);
    return instanceDto;
  }

  protected _createInstanceDto(instance: Instance, cloudInstance: CloudInstance, planDto: PlanDto): InstanceDto {
    return new InstanceDto({
      id: instance.id,
      cloudId: instance.cloudId,
      name: cloudInstance.name,
      description: cloudInstance.description,
      createdAt: instance.createdAt,
      hostname: cloudInstance.hostname,
      protocols: cloudInstance.protocols,
      image: cloudInstance.image,
      plan: planDto,
      flavour: cloudInstance.flavour,
      state: cloudInstance.state,
      members: instance.members
    });
  }

}
