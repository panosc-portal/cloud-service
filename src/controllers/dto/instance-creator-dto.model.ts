import { model, property } from '@loopback/repository';
import { CloudInstanceUser } from '../../models';

@model()
export class InstanceCreatorDto {
  @property({ type: 'string' })
  name: string;

  @property({ type: 'string' })
  description: string;

  @property({ type: 'number' })
  planId: number;

  @property({ type: CloudInstanceUser })
  user: CloudInstanceUser;

  constructor(data?: Partial<InstanceCreatorDto>) {
    Object.assign(this, data);
  }
}
