import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/rest';
import { Instance, } from '../models';
import { inject } from '@loopback/context';
import { InstanceService, CloudFlavourService } from '../services';
import { BaseController } from './base.controller';
import { CloudImageService } from '../services/cloud/cloud-image.service';
import { InstanceDto } from './dto/instance-dto.model';

export class InstanceController extends BaseController {
  constructor(
    @inject('services.PlanService') private _instanceService: InstanceService,
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

    return null;
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
