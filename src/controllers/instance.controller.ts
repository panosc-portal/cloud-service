import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/rest';
import { Instance, CloudInstance, } from '../models';
import { inject } from '@loopback/context';
import { InstanceService, CloudFlavourService, CloudInstanceService, CloudInstanceCreatorDto, PlanService, CloudImageService, CloudInstanceUpdatorDto } from '../services';
import { BaseController } from './base.controller';
import { InstanceDto, InstanceCreatorDto, PlanDto } from './dto';
import { InstanceUpdatorDto } from './dto/instance-updator-dto.model';

export class InstanceController extends BaseController {
  constructor(
    @inject('services.InstanceService') private _instanceService: InstanceService,
    @inject('services.PlanService') private _planService: PlanService,
    @inject('services.CloudInstanceService') private _cloudInstanceService: CloudInstanceService,
    @inject('services.CloudImageService') cloudImageService: CloudImageService,
    @inject('services.CloudFlavourService') cloudFlavourService: CloudFlavourService) {
    super(cloudImageService, cloudFlavourService);
  }

  @get('/instances', {
    summary: 'Get a list of all instances',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Instance) }
          }
        }
      }
    }
  })
  async getAll(): Promise<InstanceDto[]> {
    // Get all instances from DB
    const instances = await this._instanceService.getAll();

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

  @get('/instances/{instanceId}', {
    summary: 'Get a instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instance)
          }
        }
      }
    }
  })
  async getById(@param.path.number('instanceId') instanceId: number): Promise<InstanceDto> {
    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    const cloudInstance = await this._convertInstance(instance);
    return cloudInstance;
  }

  @post('/instances', {
    summary: 'Create a instance',
    responses: {
      '201': {
        description: 'Created',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instance)
          }
        }
      }
    }
  })
  async create(@requestBody() instanceCreator: InstanceCreatorDto): Promise<InstanceDto> {
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

    const persistedInstance = await this._instanceService.save(new Instance({
      cloudId: cloudInstance.id,
      plan: plan
    }));

    const instanceDto = this._createInstanceDto(persistedInstance, cloudInstance, planDto);
    return instanceDto;
  }

  @put('/instances/{instanceId}', {
    summary: 'Update an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Instance)
          }
        }
      }
    }
  })
  async update(@param.path.number('instanceId') instanceId: number, @requestBody() instanceUpdatorDto: InstanceUpdatorDto): Promise<InstanceDto> {
    this.throwBadRequestIfNull(instanceUpdatorDto, 'Invalid instance in request');
    this.throwBadRequestIfNotEqual(instanceId, instanceUpdatorDto.id, 'Id in path is not the same as body id');

    // Get the instance
    const instance = await this._instanceService.getById(instanceId);

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

  @del('/instances/{instanceId}', {
    summary: 'Delete a instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async delete(@param.path.number('instanceId') instanceId: number): Promise<boolean> {
    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    // Delete on cloud provider
    const cloudInstanceDeleted = await this._cloudInstanceService.delete(instance.cloudId, instance.plan.provider);

    if (cloudInstanceDeleted) {
      // (Soft) delete in local DB
      instance.deleted = true;
      const persistedInstance = await this._instanceService.save(instance);
      return persistedInstance.deleted;

    } else {
      return false;
    }
  }

  private async _convertInstance(instance: Instance): Promise<InstanceDto> {

    // Get plan details and cloud instance from the provider
    const [planDto, cloudInstance] = await Promise.all([
      this._convertPlan(instance.plan),
      this._cloudInstanceService.getById(instance.cloudId, instance.plan.provider)
    ])

    const instanceDto = this._createInstanceDto(instance, cloudInstance, planDto);
    return instanceDto;
  }

  private _createInstanceDto(instance: Instance, cloudInstance: CloudInstance, planDto: PlanDto): InstanceDto {
    return new InstanceDto({
      id: instance.id,
      cloudId: instance.cloudId,
      name: cloudInstance.name,
      description: cloudInstance.description,
      createdAt: cloudInstance.createdAt,
      hostname: cloudInstance.hostname,
      protocols: cloudInstance.protocols,
      image: cloudInstance.image,
      plan: planDto,
      flavour: cloudInstance.flavour,
      state: cloudInstance.state,
      user: cloudInstance.user
    });
  }

}
