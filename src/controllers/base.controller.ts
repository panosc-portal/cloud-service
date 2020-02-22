import { HttpErrors } from '@loopback/rest';
import { Plan, Provider, CloudImage, CloudFlavour } from '../models';
import { CloudImageService, CloudFlavourService } from '../services';
import { PlanDto } from './dto/plan-dto.model';

export class BaseController {
  constructor(protected _cloudImageService: CloudImageService, protected _cloudFlavourService: CloudFlavourService) {}

  throwNotFoundIfNull(object: any, message?: string) {
    if (object == null) {
      throw new HttpErrors.NotFound(message);
    }
  }

  throwBadRequestIfNull(object: any, message?: string) {
    if (object == null) {
      throw new HttpErrors.BadRequest(message);
    }
  }

  throwBadRequestIfEmpty(array: any[], message?: string) {
    if (array.length === 0) {
      throw new HttpErrors.BadRequest(message);
    }
  }

  throwBadRequestIfNotEqual(value1: any, value2: any, message?: string) {
    if (value1 !== value2) {
      throw new HttpErrors.BadRequest(message);
    }
  }

  throwBadRequestIfEqual(value1: any, value2: any, message?: string) {
    if (value1 === value2) {
      throw new HttpErrors.BadRequest(message);
    }
  }

  throwUnauthorizedIfNull(value: any, message?: string) {
    if (value == null) {
      throw new HttpErrors.Unauthorized(message);
    }
  }

  throwUnauthorizedIfNotEqual(value1: any, value2: any, message?: string) {
    if (value1 !== value2) {
      throw new HttpErrors.Unauthorized(message);
    }
  }

  protected async _convertPlan(plan: Plan): Promise<PlanDto> {
    // Get image and flavour from the provider
    const [image, flavour] = await Promise.all([
      this._cloudImageService.getById(plan.imageId, plan.provider),
      this._cloudFlavourService.getById(plan.flavourId, plan.provider)
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

  protected async _getProviderImagesAndFlavours(providers: Provider[]):Promise<Map<number, { provider: Provider; images: CloudImage[]; flavours: CloudFlavour[] }>> {
    // Get all cloud images and flavours from all providers
    const allProviderImagesAndFlavours = await Promise.all(
      providers.map(async provider => {
        const [images, flavours] = await Promise.all([
          this._cloudImageService.getAll(provider),
          this._cloudFlavourService.getAll(provider)
        ]);

        return {
          provider: provider,
          images: images,
          flavours: flavours
        };
      })
    );

    // Convert to map
    const providerImagesAndFlavours = allProviderImagesAndFlavours.reduce((map, obj) => map.set(obj.provider.id, obj), new Map<number, { provider: Provider; images: CloudImage[]; flavours: CloudFlavour[] }>());

    return providerImagesAndFlavours;
  }

  protected async _convertPlans(plans: Plan[]): Promise<PlanDto[]> {
    // From plans get all providers
    const providers = plans.map(plan => plan.provider).filter((provider, pos, array) => array.map(mapProvider => mapProvider.id).indexOf(provider.id) === pos);

    // Get cloud images and flavours map from all providers
    const providerImagesAndFlavours = await this._getProviderImagesAndFlavours(providers);

    // Enrich plan data with images and flavours
    const planDtos = plans.map(plan => new PlanDto({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        provider: plan.provider,
        image: providerImagesAndFlavours.get(plan.provider.id).images.find(image => image.id === plan.imageId),
        flavour: providerImagesAndFlavours.get(plan.provider.id).flavours.find(flavour => flavour.id === plan.flavourId)
      })
    );

    return planDtos;
  }
}
