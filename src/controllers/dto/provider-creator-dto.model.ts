import { model, property } from '@loopback/repository';

@model()
export class ProviderCreatorDto {
  @property({ type: 'string', required: true })
  name: string;

  @property({ type: 'string' })
  description?: string;

  @property({ type: 'number', required: true })
  url: string;

  constructor(data?: Partial<ProviderCreatorDto>) {
    Object.assign(this, data);
  }
}
