import { model, property } from '@loopback/repository';
import { ProviderDto } from './provider-dto.model';
import { CloudImage, CloudFlavour, Plan } from '../../models';
import { CloudImageService, CloudFlavourService } from '../../services';

@model()
export class PlanDto {
  @property({ type: 'number', required: true })
  id: number;

  @property({ type: 'string', required: true })
  name: string;

  @property({ type: 'string' })
  description?: string;

  @property({ type: ProviderDto, required: true })
  provider: ProviderDto;

  @property({ type: CloudImage, required: true })
  image: CloudImage;

  @property({ type: CloudFlavour, required: true })
  flavour: CloudFlavour;

  constructor(data?: Partial<PlanDto>) {
    Object.assign(this, data);
  }

  static async createForPlan(plan: Plan, cloudImageService: CloudImageService, cloudFlavourService: CloudFlavourService): Promise<PlanDto> {
    // Get image and flavour from the provider
    const [image, flavour] = await Promise.all([
      cloudImageService.getById(plan.imageId, plan.provider),
      cloudFlavourService.getById(plan.flavourId, plan.provider)
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
