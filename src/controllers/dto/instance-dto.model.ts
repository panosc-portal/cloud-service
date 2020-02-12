import { model, property } from '@loopback/repository';
import { ProviderDto } from './provider-dto.model';
import { CloudImage, CloudFlavour, Instance, CloudProtocol, CloudInstanceState } from '../../models';
import { CloudImageService, CloudFlavourService } from '../../services';
import { CloudInstanceUser } from '../../models/cloud/cloud-instance-user.model';
import { PlanDto } from './plan-dto.model';

@model()
export class InstanceDto {
  @property({ type: 'number', required: true })
  id: number;

  @property({ type: 'number', id: true })
  cloudId: number;

  @property({ type: 'string' })
  name: string;

  @property({ type: 'string' })
  description: string;

  @property({ type: 'string' })
  hostname: string;

  @property({ type: 'string' })
  computeId: string;

  @property({ type: 'date' })
  createdAt: Date;

  @property({ type: 'date' })
  updatedAt: Date;

  @property({ type: 'array', itemType: 'object' })
  protocols: CloudProtocol[];

  @property({ type: CloudFlavour })
  flavour: CloudFlavour;

  @property({ type: CloudImage })
  image: CloudImage;

  @property({ type: CloudInstanceUser })
  user: CloudInstanceUser;

  @property({ type: CloudInstanceState })
  state: CloudInstanceState;

  @property({ type: PlanDto })
  plan: PlanDto;

  constructor(data?: Partial<InstanceDto>) {
    Object.assign(this, data);
  }
}
