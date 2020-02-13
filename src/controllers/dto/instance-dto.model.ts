import { model, property } from '@loopback/repository';
import { CloudImage, CloudFlavour, CloudProtocol, CloudInstanceState } from '../../models';
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

  @property({ type: 'date' })
  createdAt: Date;

  @property({ type: 'string' })
  hostname: string;

  @property({ type: 'array', itemType: 'object' })
  protocols: CloudProtocol[];

  @property({ type: CloudFlavour })
  flavour: CloudFlavour;

  @property({ type: CloudImage })
  image: CloudImage;

  @property({ type: PlanDto })
  plan: PlanDto;

  @property({ type: CloudInstanceUser })
  user: CloudInstanceUser;

  @property({ type: CloudInstanceState })
  state: CloudInstanceState;

  constructor(data?: Partial<InstanceDto>) {
    Object.assign(this, data);
  }
}
