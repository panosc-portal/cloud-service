import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/rest';
import { Provider, CloudImage, CloudFlavour } from '../models';
import { inject } from '@loopback/context';
import { ProviderService, CloudImageService, CloudFlavourService, PlanService } from '../services';
import { BaseController } from './base.controller';
import { PlanDto, ProviderDto, ProviderCreatorDto } from './dto';

export class ProviderController extends BaseController {
  constructor(
    @inject('services.PlanService') private _planService: PlanService,
    @inject('services.ProviderService') private _providerService: ProviderService,
    @inject('services.CloudImageService') cloudImageService: CloudImageService,
    @inject('services.CloudFlavourService') cloudFlavourService: CloudFlavourService) {
    super(cloudImageService, cloudFlavourService);
  }

  @get('/providers', {
    summary: 'Get a list of all providers',
    "tags": [
      "Provider"
    ],
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Provider) }
          }
        }
      }
    }
  })
  getAll(): Promise<Provider[]> {
    return this._providerService.getAll();
  }

  @get('/providers/{providerId}', {
    summary: 'Get a provider by a given identifier',
    "tags": [
      "Provider"
    ],
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Provider)
          }
        }
      }
    }
  })
  async getById(@param.path.number('providerId') providerId: number): Promise<Provider> {
    const provider = await this._providerService.getById(providerId);

    this.throwNotFoundIfNull(provider, 'Provider with given id does not exist');

    return provider;
  }

  @post('/providers', {
    summary: 'Add a provider',
    "tags": [
      "Provider"
    ],
    responses: {
      '201': {
        description: 'Created',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Provider)
          }
        }
      }
    }
  })
  async create(@requestBody() providerCreator: ProviderCreatorDto): Promise<Provider> {
    const provider: Provider = new Provider({
      name: providerCreator.name,
      description: providerCreator.description,
      url: providerCreator.url
    });

    const persistedProvider = await this._providerService.save(provider);

    return persistedProvider;
  }

  @put('/providers/{providerId}', {
    summary: 'Update an provider by a given identifier',
    "tags": [
      "Provider"
    ],
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Provider)
          }
        }
      }
    }
  })
  async update(@param.path.number('providerId') providerId: number, @requestBody() providerDto: ProviderDto): Promise<Provider> {
    this.throwBadRequestIfNull(providerDto, 'Provider with given id does not exist');
    this.throwBadRequestIfNotEqual(providerId, providerDto.id, 'Id in path is not the same as body id');

    const provider = await this._providerService.getById(providerId);
    this.throwNotFoundIfNull(provider, 'Provider with given id does not exist');

    provider.name = providerDto.name;
    provider.description = providerDto.description ? providerDto.description : provider.description;
    provider.url = providerDto.url;

    return this._providerService.save(provider);
  }

  @del('/providers/{providerId}', {
    summary: 'Delete a provider by a given identifier',
    "tags": [
      "Provider"
    ],
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async delete(@param.path.number('providerId') providerId: number): Promise<boolean> {
    const provider = await this._providerService.getById(providerId);
    this.throwNotFoundIfNull(provider, 'Provider with given id does not exist');

    return this._providerService.delete(provider);
  }

  @get('/providers/{providerId}/images', {
    summary: 'Get the images of a provider having a specific identifier',
    "tags": [
      "Provider"
    ],
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(CloudImage, {title: 'Image'}) }
          }
        }
      }
    }
  })
  async getImagesForProvider(@param.path.number('providerId') providerId: number): Promise<CloudImage[]> {
    const provider = await this._providerService.getById(providerId);
    this.throwNotFoundIfNull(provider, 'Provider with given id does not exist');

    const images = await this._cloudImageService.getAll(provider);
    return images;
  }

  @get('/providers/{providerId}/images/{imageId}/plans', {
    summary: 'Get the flavours of a provider having a specific identifier',
    "tags": [
      "Provider"
    ],
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(PlanDto, {title: 'Plan'}) }
          }
        }
      }
    }
  })
  async getPlansForProviderImage(@param.path.number('providerId') providerId: number, @param.path.number('imageId') imageId: number): Promise<PlanDto[]> {
    // Ensure provider exists
    const provider = await this._providerService.getById(providerId);
    this.throwNotFoundIfNull(provider, 'Provider with given id does not exist');

    // Ensure image exists
    const image = await this._cloudImageService.getById(imageId, provider);
    this.throwNotFoundIfNull(provider, 'Image with given id does not exist for the given provider');

    // Get all associated plans and flavours
    const [plans, flavours] = await Promise.all([
      this._planService.getAllByProviderandImage(provider, image),
      this._cloudFlavourService.getAll(provider)
    ]);

    // Enrich plan data with images and flavours
    const planDtos = plans.map(plan => new PlanDto({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        provider: plan.provider,
        image: image,
        flavour: flavours.find(flavour => flavour.id === plan.flavourId)
      })
    );

    return planDtos;
  }

  @get('/providers/{providerId}/flavours', {
    summary: 'Get the flavours of a provider having a specific identifier',
    "tags": [
      "Provider"
    ],
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(CloudFlavour, {title: 'Flavour'}) }
          }
        }
      }
    }
  })
  async getFlavoursForProvider(@param.path.number('providerId') providerId: number): Promise<CloudFlavour[]> {
    const provider = await this._providerService.getById(providerId);
    this.throwNotFoundIfNull(provider, 'Provider with given id does not exist');

    const flavours = await this._cloudFlavourService.getAll(provider);
    return flavours;
  }

}
