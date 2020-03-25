import { model, property } from '@loopback/repository';

@model()
export class CloudInstanceAccount {
  @property({
    type: 'number'
  })
  userId: number;

  @property({
    type: 'string'
  })
  username: string;

  @property({
    type: 'number'
  })
  gid: number;

  @property({
    type: 'number'
  })
  uid: number;

  @property({
    type: 'string'
  })
  homePath: string;

  @property({
    type: 'string'
  })
  email: string;

  constructor(data?: Partial<CloudInstanceAccount>) {
    Object.assign(this, data);
  }
}
