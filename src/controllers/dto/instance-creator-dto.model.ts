import { model, property } from '@loopback/repository';
import { CloudInstanceUser } from '../../models/cloud/cloud-instance-user.model';
import { PlanDto } from './plan-dto.model';

@model()
export class InstanceDto {
  @property({ type: 'string' })
  name: string;

  @property({ type: 'string' })
  description: string;

  @property({ type: PlanDto })
  plan: PlanDto;

  @property({ type: CloudInstanceUser })
  user: CloudInstanceUser;

  constructor(data?: Partial<InstanceDto>) {
    Object.assign(this, data);
  }
}
