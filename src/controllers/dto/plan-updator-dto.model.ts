import { model, property } from '@loopback/repository';

@model()
export class PlanUpdatorDto {
  @property({ type: 'number', required: true })
  id: number;

  @property({ type: 'string', required: true })
  name: string;

  @property({ type: 'string' })
  description?: string;

  @property({ type: 'number', required: true })
  providerId: number;

  @property({ type: 'number', required: true })
  imageId: number;

  @property({ type: 'number', required: true })
  flavourId: number;

  constructor(data?: Partial<PlanUpdatorDto>) {
    Object.assign(this, data);
  }
}
