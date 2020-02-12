import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/rest';
import { Plan, CloudImage, Provider, CloudFlavour } from '../models';
import { inject } from '@loopback/context';
import { PlanService, ProviderService, CloudFlavourService } from '../services';
import { BaseController } from './base.controller';
import { PlanCreatorDto } from './dto/plan-creator-dto.model';
import { PlanUpdatorDto } from './dto/plan-updator-dto.model';
import { CloudImageService } from '../services/cloud/cloud-image.service';
import { PlanDto } from './dto/plan-dto.model';

export class PlanController extends BaseController {
  constructor(
    @inject('services.PlanService') private _planService: PlanService,
    @inject('services.ProviderService') private _providerService: ProviderService,
    @inject('services.CloudImageService') cloudImageService: CloudImageService,
    @inject('services.CloudFlavourService') cloudFlavourService: CloudFlavourService) {
    super(cloudImageService, cloudFlavourService);
  }

  @get('/plans', {
    summary: 'Get a list of all plans',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Plan) }
          }
        }
      }
    }
  })
  async getAll(): Promise<PlanDto[]> {
    // Get all plans from DB
    const plans = await this._planService.getAll();

    // Convert to DTOs
    return this.convertPlans(plans);
  }

  @get('/plans/{planId}', {
    summary: 'Get a plan by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Plan)
          }
        }
      }
    }
  })
  async getById(@param.path.number('planId') planId: number): Promise<PlanDto> {
    const plan = await this._planService.getById(planId);
    this.throwNotFoundIfNull(plan, 'Plan with given id does not exist');

    return this.convertPlan(plan);
  }

  @post('/plans', {
    summary: 'Create a plan',
    responses: {
      '201': {
        description: 'Created',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Plan)
          }
        }
      }
    }
  })
  async create(@requestBody() planCreator: PlanCreatorDto): Promise<PlanDto> {
    const provider = await this._providerService.getById(planCreator.providerId);
    this.throwBadRequestIfNull(provider, 'Provider with given id does not exist');

    const plan: Plan = new Plan({
      name: planCreator.name,
      description: planCreator.description,
      provider: provider,
      imageId: planCreator.imageId,
      flavourId: planCreator.flavourId
    });

    const persistedPlan = await this._planService.save(plan);
    return this.convertPlan(persistedPlan);
  }

  @put('/plans/{planId}', {
    summary: 'Update an plan by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Plan)
          }
        }
      }
    }
  })
  async update(@param.path.number('planId') planId: number, @requestBody() planUpdator: PlanUpdatorDto): Promise<PlanDto> {
    this.throwBadRequestIfNull(planUpdator, 'Invalid plan in request');
    this.throwBadRequestIfNotEqual(planId, planUpdator.id, 'Id in path is not the same as body id');

    const provider = await this._providerService.getById(planUpdator.providerId);
    this.throwBadRequestIfNull(provider, 'Provider with given id does not exist');

    const plan = await this._planService.getById(planId);
    this.throwNotFoundIfNull(plan, 'Plan with given id does not exist');

    plan.name = planUpdator.name;
    plan.description = planUpdator.description ? planUpdator.description : plan.description;
    plan.provider = provider;
    plan.imageId = planUpdator.imageId;
    plan.flavourId = planUpdator.flavourId;

    const persistedPlan = await this._planService.save(plan);
    return this.convertPlan(persistedPlan);
  }

  @del('/plans/{planId}', {
    summary: 'Delete a plan by a given identifier',
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async delete(@param.path.number('planId') planId: number): Promise<boolean> {
    const plan = await this._planService.getById(planId);
    this.throwNotFoundIfNull(plan, 'Plan with given id does not exist');

    return this._planService.delete(plan);
  }
}
