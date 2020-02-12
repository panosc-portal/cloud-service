import { model, property } from '@loopback/repository';

@model()
export class ProviderDto {
  @property({ type: 'number', required: true })
  id: number;

  @property({ type: 'string', required: true })
  name: string;

  @property({ type: 'string' })
  description?: string;

  @property({ type: 'string', required: true })
  url: string;

  constructor(data?: Partial<ProviderDto>) {
    Object.assign(this, data);
  }
}
