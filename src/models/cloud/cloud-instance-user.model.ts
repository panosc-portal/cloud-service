import { model, property } from '@loopback/repository';

@model()
export class CloudInstanceUser {
  @property({
    type: 'number'
  })
  accountId: number;

  @property({
    type: 'string'
  })
  username: string;

  @property({
    type: 'string'
  })
  firstName: string;

  @property({
    type: 'string'
  })
  lastName: string;

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

  constructor(data?: Partial<CloudInstanceUser>) {
    Object.assign(this, data);
  }

}
