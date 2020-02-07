import { model, property } from '@loopback/repository';

@model()
export class CloudFlavour {
  @property({
    type: 'number',
    id: true
  })
  id: number;

  @property({
    type: 'string'
  })
  name: string;

  @property({
    type: 'string'
  })
  description?: string;

  @property({
    type: 'number'
  })
  cpu: number;

  @property({
    type: 'number'
  })
  memory: number;

  constructor(data?: Partial<CloudFlavour>) {
    Object.assign(this, data);
  }
}
