import { model, property } from '@loopback/repository';
import { Instance } from './instance.model';
import { InstanceMember } from './instance-member.model';

@model()
export class InstanceAuthorisation {

  @property({
    type: Instance,
    required: true
  })
  instance: Instance;

  @property({
    type: InstanceMember,
    required: true
  })
  instanceMember: InstanceMember;

  @property({
    type: 'string',
    required: true
  })
  username: string;

  constructor(data?: Partial<InstanceAuthorisation>) {
    Object.assign(this, data);
  }
}
