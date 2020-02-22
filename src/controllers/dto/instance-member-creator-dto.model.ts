import { model, property } from '@loopback/repository';
import { User, InstanceMemberRole } from '../../models';

@model()
export class InstanceMemberCreatorDto {
  @property({ type: User })
  user: User;

  @property({ type: 'string' })
  role: InstanceMemberRole;

  constructor(data?: Partial<InstanceMemberCreatorDto>) {
    Object.assign(this, data);
  }
}
