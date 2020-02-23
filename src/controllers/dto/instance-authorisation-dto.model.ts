import { model, property } from '@loopback/repository';
import { InstanceMember, CloudInstanceNetwork, CloudInstanceAccount } from '../../models';

@model()
export class InstanceAuthorisationDto {
  @property({ type: CloudInstanceAccount })
  account: CloudInstanceAccount;

  @property({ type: InstanceMember })
  member: InstanceMember;

  @property({ type: CloudInstanceNetwork })
  network: CloudInstanceNetwork;

  constructor(data?: Partial<InstanceAuthorisationDto>) {
    Object.assign(this, data);
  }
}
