import { model, property } from '@loopback/repository';
import { InstanceMember, CloudInstanceNetwork, CloudInstanceUser } from '../../models';

@model()
export class InstanceAuthorisationDto {
  @property({ type: CloudInstanceUser })
  account: CloudInstanceUser;

  @property({ type: InstanceMember })
  member: InstanceMember;

  @property({ type: CloudInstanceNetwork })
  network: CloudInstanceNetwork;

  constructor(data?: Partial<InstanceAuthorisationDto>) {
    Object.assign(this, data);
  }
}
