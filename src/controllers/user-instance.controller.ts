import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/rest';
import { Instance } from '../models';
import { inject } from '@loopback/context';
import { InstanceService, CloudFlavourService, CloudInstanceService, PlanService, CloudImageService, UserService } from '../services';
import { InstanceDto, InstanceCreatorDto } from './dto';
import { InstanceUpdatorDto } from './dto/instance-updator-dto.model';
import { BaseInstanceController } from './base-instance.controller';

export class UserInstanceController extends BaseInstanceController {
  constructor(
    @inject('services.InstanceService') instanceService: InstanceService,
    @inject('services.PlanService') planService: PlanService,
    @inject('services.CloudInstanceService') cloudInstanceService: CloudInstanceService,
    @inject('services.CloudImageService') cloudImageService: CloudImageService,
    @inject('services.CloudFlavourService') cloudFlavourService: CloudFlavourService,
    @inject('services.UserService') private _userService: UserService) {
    super(instanceService, planService, cloudInstanceService, cloudImageService, cloudFlavourService);
  }

  @get('/users/{userId}/instances', {
    summary: 'Get a list of all instances for a given user',
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
  async getAll(@param.path.number('userId') userId: number): Promise<InstanceDto[]> {
    const user = await this._userService.getById(userId);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');

    // Get all instances from DB
    const instances = await this._instanceService.getAllForUser(user);

    return this._convertInstances(instances);
  }

  @get('/users/{userId}/instances/{instanceId}', {
    summary: 'Get a instance by a given identifier for a specific user',
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
  async getById(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number): Promise<InstanceDto> {
    const user = await this._userService.getById(userId);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');

    const instance = await this._instanceService.getByIdForUser(instanceId, user);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');

    const cloudInstance = await this._convertInstance(instance);
    return cloudInstance;
  }

  @post('/users/{userId}/instances', {
    summary: 'Create a instance for a specific user',
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
  async create(@param.path.number('userId') userId: number, @requestBody() instanceCreator: InstanceCreatorDto): Promise<InstanceDto> {
    this.throwBadRequestIfNotEqual(userId, instanceCreator.user.accountId, 'The user can only create an instance where they are the owner');

    return this._createInstance(instanceCreator);
  }

  @put('/users/{userId}/instances/{instanceId}', {
    summary: 'Update an instance by a given identifier for a specific user',
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
  async update(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number, @requestBody() instanceUpdatorDto: InstanceUpdatorDto): Promise<InstanceDto> {
    this.throwBadRequestIfNull(instanceUpdatorDto, 'Invalid instance in request');
    this.throwBadRequestIfNotEqual(instanceId, instanceUpdatorDto.id, 'Id in path is not the same as body id');

    const user = await this._userService.getById(userId);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');

    // Get the instance
    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');

    return this._updateInstance(instance, instanceUpdatorDto);
  }

  @del('/users/{userId}/instances/{instanceId}', {
    summary: 'Delete a instance by a given identifier for a specific user',
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async delete(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number): Promise<boolean> {
    const user = await this._userService.getById(userId);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');

    const instance = await this._instanceService.getByIdForUser(instanceId, user);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for given user');

    return this._deleteInstance(instanceId);
  }

}
