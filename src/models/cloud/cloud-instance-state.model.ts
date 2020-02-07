import { model, property } from '@loopback/repository';

@model()
export class CloudInstanceState {
  @property({
    type: 'string'
  })
  status: string;

  @property({
    type: 'string'
  })
  message: string;

  @property({
    type: 'number'
  })
  cpu: number;

  @property({
    type: 'number'
  })
  memory: number;

  constructor(data?: Partial<CloudInstanceState>) {
    Object.assign(this, data);
  }
}
