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
    @inject('services.CloudImageService') private _cloudImageService: CloudImageService,
    @inject('services.CloudFlavourService') private _cloudFlavourService: CloudFlavourService,
    @inject('services.ProviderService') private _providerService: ProviderService
  ) {
    super();
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
    const plans = await this._planService.getAll();
    const providers = plans.map(plan => plan.provider).filter((item, pos, array) => array.indexOf(item) == pos);
    const allProviderImagesAndFlavours = await Promise.all(providers.map(async provider => ({
      provider: provider,
      images: await this._cloudImageService.getAll(provider),
      flavours: await this._cloudFlavourService.getAll(provider)
    })));

    // Convert to map
    const providerImagesAndFlavours = allProviderImagesAndFlavours.reduce((map, obj) => {
      map.set(obj.provider.id, obj);
      return map;
    }, new Map<number, {provider: Provider, images: CloudImage[], flavours: CloudFlavour[]}>());


    const planDtos = plans.map(plan => new PlanDto({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      provider: plan.provider,
      image: providerImagesAndFlavours.get(plan.provider.id).images.find(image => image.id === plan.imageId),
      flavour: providerImagesAndFlavours.get(plan.provider.id).flavours.find(flavour => flavour.id === plan.flavourId)
    }));

    return planDtos;
  }

  @get('/plans/{id}', {
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
  async getById(@param.path.string('id') id: number): Promise<PlanDto> {
    const plan = await this._planService.getById(id);
    this.throwNotFoundIfNull(plan, 'Plan with given id does not exist');

    return this._convertPlan(plan);
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
    return this._convertPlan(persistedPlan);
  }

  @put('/plans/{id}', {
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
  async update(@param.path.number('id') id: number, @requestBody() planUpdator: PlanUpdatorDto): Promise<PlanDto> {
    this.throwBadRequestIfNull(planUpdator, 'Invalid plan in request');
    this.throwBadRequestIfNotEqual(id, planUpdator.id, 'Id in path is not the same as body id');

    const provider = await this._providerService.getById(planUpdator.providerId);
    this.throwBadRequestIfNull(provider, 'Provider with given id does not exist');

    const plan = await this._planService.getById(id);
    this.throwNotFoundIfNull(plan, 'Plan with given id does not exist');

    plan.name = planUpdator.name;
    plan.description = planUpdator.description ? planUpdator.description : plan.description;
    plan.provider = provider;
    plan.imageId = planUpdator.imageId;
    plan.flavourId = planUpdator.flavourId;

    const persistedPlan = await this._planService.save(plan);
    return this._convertPlan(persistedPlan);
  }

  @del('/plans/{id}', {
    summary: 'Delete a plan by a given identifier',
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async delete(@param.path.string('id') id: number): Promise<boolean> {
    const plan = await this._planService.getById(id);
    this.throwNotFoundIfNull(plan, 'Plan with given id does not exist');

    return this._planService.delete(plan);
  }

  private async _convertPlan(plan: Plan): Promise<PlanDto> {
    const [image, flavour] = await Promise.all([
      this._cloudImageService.getById(plan.imageId, plan.provider),
      this._cloudFlavourService.getById(plan.flavourId, plan.provider),
    ]);

    const planDto = new PlanDto({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      provider: plan.provider,
      image: image,
      flavour: flavour
    });

    return planDto;
  }
}
