import { model, property } from '@loopback/repository';
import { InstanceMember } from './instance-member.model';

@model()
export class InstanceAuthorisation {
  @property({
    type: InstanceMember,
    required: true
  })
  instanceMember: InstanceMember;

  constructor(data?: Partial<InstanceAuthorisation>) {
    Object.assign(this, data);
  }
}
