import { model, property } from '@loopback/repository';

@model()
export class PlanCreatorDto {
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

  constructor(data?: Partial<PlanCreatorDto>) {
    Object.assign(this, data);
  }
}
