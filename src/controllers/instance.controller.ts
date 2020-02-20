import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/rest';
import { Instance, CloudInstanceState, CloudInstanceNetwork, CloudInstanceCommand } from '../models';
import { inject } from '@loopback/context';
import { InstanceService, CloudFlavourService, CloudInstanceService, PlanService, CloudImageService } from '../services';
import { InstanceDto, InstanceCreatorDto } from './dto';
import { InstanceUpdatorDto } from './dto/instance-updator-dto.model';
import { BaseInstanceController } from './base-instance.controller';

export class InstanceController extends BaseInstanceController {
  constructor(
    @inject('services.InstanceService') instanceService: InstanceService,
    @inject('services.PlanService') planService: PlanService,
    @inject('services.CloudInstanceService') cloudInstanceService: CloudInstanceService,
    @inject('services.CloudImageService') cloudImageService: CloudImageService,
    @inject('services.CloudFlavourService') cloudFlavourService: CloudFlavourService) {
    super(instanceService, planService, cloudInstanceService, cloudImageService, cloudFlavourService);
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

    return this._convertInstances(instances);
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
    return this._createInstance(instanceCreator);
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
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    return this._updateInstance(instance, instanceUpdatorDto);
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
    return this._deleteInstance(instanceId);
  }

  @get('/instances/{instanceId}/state', {
    summary: 'Get the state of an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(CloudInstanceState)
          }
        }
      }
    }
  })
  async getState(@param.path.number('instanceId') instanceId: number): Promise<CloudInstanceState> {
    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    // Get state from cloud instance service
    const state = await this._cloudInstanceService.getStateById(instance.cloudId, instance.plan.provider);
    return state;
  }

  @get('/instances/{instanceId}/network', {
    summary: 'Get the network of an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(CloudInstanceNetwork)
          }
        }
      }
    }
  })
  async getNetwork(@param.path.number('instanceId') instanceId: number): Promise<CloudInstanceNetwork> {
    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    // Get network from cloud instance service
    const network = await this._cloudInstanceService.getNetworkById(instance.cloudId, instance.plan.provider);
    return network;
  }

  @post('/instances/{instanceId}/actions', {
    summary: 'Invoke an action for a given instance',
    responses: {
      '201': {
        description: 'Created'
      }
    }
  })
  async executeAction(@param.path.number('instanceId') instanceId: number, @requestBody() command: CloudInstanceCommand): Promise<InstanceDto> {
    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    // Send command to the cloud service
    const [cloudInstance, planDto] = await Promise.all([
      this._cloudInstanceService.executeActionById(instance.cloudId, command, instance.plan.provider),
      this._convertPlan(instance.plan)
    ])

    const instanceDto = this._createInstanceDto(instance, cloudInstance, planDto);
    return instanceDto;
  }

  @get('/instances/{instanceId}/token/{token}/validate', {
    summary: 'Validates an authorisation token for a given instance for a specific user',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(CloudInstanceState)
          }
        }
      }
    }
  })
  async validateToken(@param.path.number('instanceId') instanceId: number, @param.path.number('token') token: string): Promise<string> {
    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    // Validate token with instance token service
    // Return instance and associated user
    // TODO
    return new Promise<string>((resolve) => {resolve()});
  }
}
