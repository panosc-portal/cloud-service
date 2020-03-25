import { get, getModelSchemaRef, param, put, requestBody, post, del, HttpErrors } from '@loopback/rest';
import { CloudInstanceState, CloudInstanceNetwork, CloudInstanceCommand, InstanceMember, InstanceMemberRole, Pagination } from '../models';
import { inject } from '@loopback/context';
import { InstanceService, CloudFlavourService, CloudInstanceService, PlanService, CloudImageService, InstanceMemberService } from '../services';
import { InstanceDto, InstanceCreatorDto, InstanceUpdatorDto, InstanceMemberCreatorDto, InstanceMemberUpdatorDto, AuthorisationTokenDto } from './dto';
import { BaseInstanceController } from './base-instance.controller';
import { AuthorisationTokenService } from '../services/authorisation-token.service';
import { InstanceAuthorisationDto } from './dto/instance-authorisation-dto.model';

export class InstanceController extends BaseInstanceController {
  constructor(
    @inject('services.InstanceService') instanceService: InstanceService,
    @inject('services.PlanService') planService: PlanService,
    @inject('services.CloudInstanceService') cloudInstanceService: CloudInstanceService,
    @inject('services.CloudImageService') cloudImageService: CloudImageService,
    @inject('services.CloudFlavourService') cloudFlavourService: CloudFlavourService,
    @inject('services.InstanceMemberService') private _instanceMemberService: InstanceMemberService,
    @inject('services.AuthorisationTokenService') private _authorisationTokenService: AuthorisationTokenService) {
    super(instanceService, planService, cloudInstanceService, cloudImageService, cloudFlavourService);
  }

  @get('/instances', {
    summary: 'Get a list of all instances',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(InstanceDto) }
          }
        }
      }
    }
  })
  async getAll(@param.query.number('page') page: number, @param.query.number('limit') limit: number): Promise<InstanceDto[]> {

    page = page || 1;
    limit = limit || 25;
    const offset = (page - 1) * limit;

    // Get all instances from DB
    const instances = await this._instanceService.getAll(new Pagination({offset: offset, limit: limit}));

    return this._convertInstances(instances);
  }

  @get('/instances/{instanceId}', {
    summary: 'Get a instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(InstanceDto)
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
            schema: getModelSchemaRef(InstanceDto)
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
            schema: getModelSchemaRef(InstanceDto)
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
        description: 'Created',
        content: {
          'application/json': {
            schema: getModelSchemaRef(InstanceDto)
          }
        }
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

  @post('/instances/{instanceId}/token', {
    summary: 'Create an authorisation token for a given instance for the owner',
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
  async createToken(@param.path.number('instanceId') instanceId: number): Promise<AuthorisationTokenDto> {
    const [instance, owner] = await Promise.all([
      this._instanceService.getById(instanceId),
      this._instanceMemberService.getForOwnerOfInstanceId(instanceId)
    ]);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    // Create token with instance token service for connected member
    const authorisationToken = await this._authorisationTokenService.create(owner);
    const authorisationTokenDto = new AuthorisationTokenDto({ token: authorisationToken.token})

    return authorisationTokenDto;
  }

  @get('/instances/{instanceId}/token/{token}/validate', {
    summary: 'Validates an authorisation token for a given instance',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(InstanceAuthorisationDto)
          }
        }
      }
    }
  })
  async validateToken(@param.path.number('instanceId') instanceId: number, @param.path.string('token') token: string): Promise<InstanceAuthorisationDto> {
    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    // Validate token with instance token service
    try {
      const instanceAuthorisation = await this._authorisationTokenService.validate(instanceId, token);
      const cloudInstance = await this._cloudInstanceService.getById(instance.cloudId, instance.plan.provider);

      return new InstanceAuthorisationDto({
        member: instanceAuthorisation.instanceMember,
        account: cloudInstance.account,
        network: new CloudInstanceNetwork({
          hostname: cloudInstance.hostname,
          protocols: cloudInstance.protocols
        })
      });

    } catch (error) {
      if (error.isTokenInvalidError) {
        throw new HttpErrors.Unauthorized(error.message);

      } else {
        throw new HttpErrors.InternalServerError(error.message);
      }
    }
  }

  @get('/instances/{instanceId}/members', {
    summary: 'Get a list of all members for an instance',
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
  async getAllInstanceMembers(@param.path.number('instanceId') instanceId: number): Promise<InstanceMember[]> {
    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');

    return this._instanceMemberService.getForInstanceId(instanceId);
  }

  @post('/instances/{instanceId}/members', {
    summary: 'Create a member for an instance',
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
  async createInstanceMember(@param.path.number('instanceId') instanceId: number, @requestBody() instanceMemberCreatorDto: InstanceMemberCreatorDto): Promise<InstanceMember> {
    this.throwBadRequestIfNull(instanceMemberCreatorDto, 'Invalid instance member in request');
    this.throwBadRequestIfEqual(instanceMemberCreatorDto.role, InstanceMemberRole.OWNER, 'An owner cannot be added to an instance');

    const instance = await this._instanceService.getById(instanceId);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist');
    this.throwBadRequestIfEqual(instanceMemberCreatorDto.role, InstanceMemberRole.OWNER, 'An owner cannot be added to an instance');

    const instanceMember = new InstanceMember({
      instance: instance,
      user: instanceMemberCreatorDto.user,
      role: instanceMemberCreatorDto.role
    });

    return this._instanceMemberService.save(instanceMember);
  }

  @put('/instances/{instanceId}/members/{memberId}', {
    summary: 'Update a member of an instance by a given identifier',
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
  async updateInstanceMember(@param.path.number('instanceId') instanceId: number, @param.path.number('memberId') memberId: number, @requestBody() instanceMemberUpdatorDto: InstanceMemberUpdatorDto): Promise<InstanceMember> {
    this.throwBadRequestIfNull(instanceMemberUpdatorDto, 'Invalid instance in request');
    this.throwBadRequestIfNotEqual(memberId, instanceMemberUpdatorDto.id, 'Id in path is not the same as body id');

    const [instance, originalInstanceMember] = await Promise.all([
      this._instanceService.getById(instanceId),
      this._instanceMemberService.getById(memberId)
    ]);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');
    this.throwNotFoundIfNull(originalInstanceMember, 'Instance member with given id does not exist for this given instance and user');
    this.throwBadRequestIfEqual(instanceMemberUpdatorDto.role, InstanceMemberRole.OWNER, 'Cannot have more than one owner of an instance');
    this.throwBadRequestIfEqual(originalInstanceMember.role, InstanceMemberRole.OWNER, 'Cannot change the owner of an instance');

    originalInstanceMember.role = instanceMemberUpdatorDto.role;
    return this._instanceMemberService.save(originalInstanceMember);
  }

  @del('/instances/{instanceId}/members/{memberId}', {
    summary: 'Delete an instance member of an instance by a given identifier',
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async deleteInstanceMember(@param.path.number('instanceId') instanceId: number, @param.path.number('memberId') memberId: number): Promise<boolean> {
    const [instance, originalInstanceMember] = await Promise.all([
      this._instanceService.getById(instanceId),
      this._instanceMemberService.getById(memberId)
    ]);
    this.throwNotFoundIfNull(instance, 'Instance with given id does not exist for this given user');
    this.throwNotFoundIfNull(originalInstanceMember, 'Instance member with given id does not exist for this given instance and user');
    this.throwBadRequestIfEqual(originalInstanceMember.role, InstanceMemberRole.OWNER, 'Cannot delete the owner from an instance');

    return this._instanceMemberService.delete(originalInstanceMember);
  }



}
