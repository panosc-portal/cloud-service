import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/rest';
import { Instance, Provider, CloudInstance, } from '../models';
import { inject } from '@loopback/context';
import { InstanceService, CloudFlavourService, CloudInstanceService } from '../services';
import { BaseController } from './base.controller';
import { CloudImageService } from '../services/cloud/cloud-image.service';
import { InstanceDto } from './dto/instance-dto.model';
import { hostname } from 'os';

export class InstanceController extends BaseController {
  constructor(
    @inject('services.InstanceService') private _instanceService: InstanceService,
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
      this.convertPlans(plans),
      Promise.all(
        providers.map(async provider => {
          const instances = await this._cloudInstanceService.getAll(provider);

          return {
            provider: provider,
            instances: instances
          };
        })
      )
    ]);

    // Convert to map
    const providerInstances = allProviderInstances.reduce((map, obj) => map.set(obj.provider.id, obj.instances), new Map<number, CloudInstance[]>());

    const instanceDtos = instances.map(instance => {
      const cloudInstance = providerInstances.get(instance.plan.provider.id).find(cloudInstance => cloudInstance.id === instance.cloudId)
      return new InstanceDto({
        id: instance.id,
        cloudId: instance.cloudId,
        name: cloudInstance.name,
        description: cloudInstance.description,
        createdAt: cloudInstance.createdAt,
        hostname: cloudInstance.hostname,
        protocols: cloudInstance.protocols,
        image: cloudInstance.image,
        plan: planDtos.find(planDto => planDto.id === instance.plan.id),
        flavour: cloudInstance.flavour,
        state: cloudInstance.state,
        user: cloudInstance.user
      })
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

    return null;
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
  async create(): Promise<InstanceDto> {
    return null;
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
  async update(@param.path.number('instanceId') instanceId: number): Promise<InstanceDto> {
    return null;
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

    // TODO
    // delete on cloud provider

    return this._instanceService.delete(instance);
  }
}
