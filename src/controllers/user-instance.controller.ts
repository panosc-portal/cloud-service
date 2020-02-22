import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/rest';
import { Instance, InstanceMemberRole, CloudInstanceState, CloudInstanceNetwork, CloudInstanceCommand, InstanceMember } from '../models';
import { inject } from '@loopback/context';
import { InstanceService, CloudFlavourService, CloudInstanceService, PlanService, CloudImageService, UserService, InstanceMemberService } from '../services';
import { InstanceDto, InstanceCreatorDto, AuthorisationTokenCreatorDto, InstanceUpdatorDto, InstanceMemberCreatorDto, InstanceMemberUpdatorDto } from './dto';
import { BaseInstanceController } from './base-instance.controller';
import { AuthorisationTokenService } from '../services/authorisation-token.service';
import { AuthorisationTokenDto } from './dto/authorisation-token-dto.model';

export class UserInstanceController extends BaseInstanceController {
  constructor(
    @inject('services.InstanceService') instanceService: InstanceService,
    @inject('services.PlanService') planService: PlanService,
    @inject('services.CloudInstanceService') cloudInstanceService: CloudInstanceService,
    @inject('services.CloudImageService') cloudImageService: CloudImageService,
    @inject('services.CloudFlavourService') cloudFlavourService: CloudFlavourService,
    @inject('services.UserService') private _userService: UserService,
    @inject('services.InstanceMemberService') private _instanceMemberService: InstanceMemberService,
    @inject('services.AuthorisationTokenService') private _authorisationTokenService: AuthorisationTokenService) {
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
    if (user == null) {
      return [];
    }

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
    const [user, instance] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId)
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
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

    const [user, instance, connectedMember] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId),
      this._instanceMemberService.getForUserIdAndInstanceId(userId, instanceId)
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');
    this.throwUnauthorizedIfNull(connectedMember, 'User with given id is not a member of the given instance');
    this.throwUnauthorizedIfNotEqual(connectedMember.role, InstanceMemberRole.OWNER, 'Only the owner can update an instance');

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
    const [user, instance, connectedMember] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId),
      this._instanceMemberService.getForUserIdAndInstanceId(userId, instanceId)
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');
    this.throwUnauthorizedIfNull(connectedMember, 'User with given id is not a member of the given instance');
    this.throwUnauthorizedIfNotEqual(connectedMember.role, InstanceMemberRole.OWNER, 'Only the owner can update an instance');

    return this._deleteInstance(instanceId);
  }

  @get('/users/{userId}/instances/{instanceId}/state', {
    summary: 'Get the state of an instance by a given identifier for a specific user',
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
  async getState(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number): Promise<CloudInstanceState> {
    const [user, instance] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId),
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');

    // Get state from cloud instance service
    const state = await this._cloudInstanceService.getStateById(instance.cloudId, instance.plan.provider);
    return state;
  }

  @get('/users/{userId}/instances/{instanceId}/network', {
    summary: 'Get the network of an instance by a given identifier for a specific user',
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
  async getNetwork(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number): Promise<CloudInstanceNetwork> {
    const [user, instance] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId),
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');

    // Get network from cloud instance service
    const network = await this._cloudInstanceService.getNetworkById(instance.cloudId, instance.plan.provider);
    return network;
  }

  @post('/users/{userId}/instances/{instanceId}/actions', {
    summary: 'Invoke an action for a given instance for a specific user',
    responses: {
      '201': {
        description: 'Created'
      }
    }
  })
  async executeAction(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number, @requestBody() command: CloudInstanceCommand): Promise<InstanceDto> {
    const [user, instance, connectedMember] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId),
      this._instanceMemberService.getForUserIdAndInstanceId(userId, instanceId)
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');
    this.throwUnauthorizedIfNull(connectedMember, 'User with given id is not a member of the given instance');
    this.throwUnauthorizedIfNotEqual(connectedMember.role, InstanceMemberRole.OWNER, 'Only the owner can update an instance');

    // Send command to the cloud service
    const [cloudInstance, planDto] = await Promise.all([
      this._cloudInstanceService.executeActionById(instance.cloudId, command, instance.plan.provider),
      this._convertPlan(instance.plan)
    ])

    const instanceDto = this._createInstanceDto(instance, cloudInstance, planDto);
    return instanceDto;
  }

  @post('/users/{userId}/instances/{instanceId}/token', {
    summary: 'Create an authorisation token for a given instance for a specific user',
    responses: {
      '201': {
        description: 'Created',
        content: {
          'application/json': {
            schema: getModelSchemaRef(AuthorisationTokenDto)
          }
        }
      }
    }
  })
  async createToken(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number, @requestBody() tokenCreatorDto: AuthorisationTokenCreatorDto): Promise<AuthorisationTokenDto> {
    const [user, instance, connectedMember] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId),
      this._instanceMemberService.getForUserIdAndInstanceId(userId, instanceId)
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');
    this.throwUnauthorizedIfNull(connectedMember, 'User with given id is not a member of the given instance');

    // Create token with instance token service for connected member
    const authorisationToken = await this._authorisationTokenService.create(tokenCreatorDto.username, connectedMember);
    const authorisationTokenDto = new AuthorisationTokenDto({ token: authorisationToken.token})

    return authorisationTokenDto;
  }

  @get('/users/{userId}/instances/{instanceId}/members', {
    summary: 'Get a list of all members for an instance for a given user',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(InstanceMember) }
          }
        }
      }
    }
  })
  async getAllInstanceMembers(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number): Promise<InstanceMember[]> {
    const [user, instance] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId),
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');

    return this._instanceMemberService.getForInstanceId(instanceId);
  }

  @post('/users/{userId}/instances/{instanceId}/members', {
    summary: 'Create a member for an instance for a specific user',
    responses: {
      '201': {
        description: 'Created',
        content: {
          'application/json': {
            schema: getModelSchemaRef(InstanceMember)
          }
        }
      }
    }
  })
  async createInstanceMember(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number, @requestBody() instanceMemberCreatorDto: InstanceMemberCreatorDto): Promise<InstanceMember> {
    this.throwBadRequestIfNull(instanceMemberCreatorDto, 'Invalid instance member in request');

    const [user, instance, connectedMember, existingMember] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId),
      this._instanceMemberService.getForUserIdAndInstanceId(userId, instanceId),
      this._instanceMemberService.getForUserIdAndInstanceId(instanceMemberCreatorDto.user.id, instanceId)
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');
    this.throwUnauthorizedIfNull(connectedMember, 'User with given id is not a member of the given instance');
    this.throwUnauthorizedIfNotEqual(connectedMember.role, InstanceMemberRole.OWNER, 'Only the owner can update an instance');
    this.throwBadRequestIfEqual(instanceMemberCreatorDto.role, InstanceMemberRole.OWNER, 'An owner cannot be added to an instance');

    if (existingMember) {
      return existingMember;
    }

    const instanceMember = new InstanceMember({
      instance: instance,
      user: instanceMemberCreatorDto.user,
      role: instanceMemberCreatorDto.role
    });

    return this._instanceMemberService.save(instanceMember);
  }

  @put('/users/{userId}/instances/{instanceId}/members/{memberId}', {
    summary: 'Update a member of an instance by a given identifier for a specific user',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(InstanceMember)
          }
        }
      }
    }
  })
  async updateInstanceMember(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number, @param.path.number('memberId') memberId: number, @requestBody() instanceMemberUpdatorDto: InstanceMemberUpdatorDto): Promise<InstanceMember> {
    this.throwBadRequestIfNull(instanceMemberUpdatorDto, 'Invalid instance in request');
    this.throwBadRequestIfNotEqual(memberId, instanceMemberUpdatorDto.id, 'Id in path is not the same as body id');

    const [user, instance, connectedMember, originalInstanceMember] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId),
      this._instanceMemberService.getForUserIdAndInstanceId(userId, instanceId),
      this._instanceMemberService.getById(memberId)
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');
    this.throwNotFoundIfNull(originalInstanceMember, 'Instance member with given id does not exist for this given instance and user');
    this.throwUnauthorizedIfNull(connectedMember, 'User with given id is not a member of the given instance');
    this.throwUnauthorizedIfNotEqual(connectedMember.role, InstanceMemberRole.OWNER, 'Only the owner can update an instance');
    this.throwBadRequestIfEqual(instanceMemberUpdatorDto.role, InstanceMemberRole.OWNER, 'Cannot have more than one owner of an instance');
    this.throwBadRequestIfEqual(originalInstanceMember.role, InstanceMemberRole.OWNER, 'Cannot change the owner of an instance');

    originalInstanceMember.role = instanceMemberUpdatorDto.role;
    return this._instanceMemberService.save(originalInstanceMember);
  }

  @del('/users/{userId}/instances/{instanceId}/members/{memberId}', {
    summary: 'Delete an instance member of an instance by a given identifier for a specific user',
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async deleteInstanceMember(@param.path.number('userId') userId: number, @param.path.number('instanceId') instanceId: number, @param.path.number('memberId') memberId: number): Promise<boolean> {
    const [user, instance, connectedMember, originalInstanceMember] = await Promise.all([
      this._userService.getById(userId),
      this._instanceService.getByIdForUserId(instanceId, userId),
      this._instanceMemberService.getForUserIdAndInstanceId(userId, instanceId),
      this._instanceMemberService.getById(memberId)
    ]);
    this.throwNotFoundIfNull(user, 'User with given id does not exist');
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');
    this.throwNotFoundIfNull(originalInstanceMember, 'Instance member with given id does not exist for this given instance and user');
    this.throwUnauthorizedIfNull(connectedMember, 'User with given id is not a member of the given instance');
    this.throwUnauthorizedIfNotEqual(connectedMember.role, InstanceMemberRole.OWNER, 'Only the owner can update an instance');
    this.throwBadRequestIfEqual(originalInstanceMember.role, InstanceMemberRole.OWNER, 'Cannot delete the owner from an instance');

    return this._instanceMemberService.delete(originalInstanceMember);
  }
}
