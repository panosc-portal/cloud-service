import { model, property } from '@loopback/repository';

@model()
export class CloudProtocol {
  @property({
    type: 'string'
  })
  name: string;

  @property({
    type: 'number'
  })
  port: number;

  @property({
    type: 'number'
  })
  internalPort: number;

  constructor(data?: Partial<CloudProtocol>) {
    Object.assign(this, data);
  }
}
