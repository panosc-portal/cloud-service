import { model, property } from '@loopback/repository';

@model()
export class InstanceUpdatorDto {
  @property({ type: 'number' })
  id: number;

  @property({ type: 'string' })
  name: string;

  @property({ type: 'string' })
  description: string;

  constructor(data?: Partial<InstanceUpdatorDto>) {
    Object.assign(this, data);
  }
}
