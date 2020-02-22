import { model, property } from '@loopback/repository';
import { InstanceMemberRole } from '../../models';

@model()
export class InstanceMemberUpdatorDto {
  @property({ type: 'number' })
  id: number;

  @property({ type: 'string' })
  role: InstanceMemberRole;

  constructor(data?: Partial<InstanceMemberUpdatorDto>) {
    Object.assign(this, data);
  }
}
