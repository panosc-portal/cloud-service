import { model, property } from '@loopback/repository';
import { ProviderDto } from './provider-dto.model';
import { CloudImage, CloudFlavour } from '../../models';

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
}
