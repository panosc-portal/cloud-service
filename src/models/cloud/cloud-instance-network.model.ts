import { model, property } from '@loopback/repository';
import { CloudProtocol } from './cloud-protocol.model';

@model()
export class CloudInstanceNetwork {
  @property({
    type: 'string'
  })
  hostname: string;

  @property({
    type: 'array',
    itemType: 'object'
  })
  protocols: CloudProtocol[];

  constructor(data?: Partial<CloudInstanceNetwork>) {
    Object.assign(this, data);
  }
}
