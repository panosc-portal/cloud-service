import { model, property } from '@loopback/repository';
import { CloudProtocol } from './cloud-protocol.model';

@model()
export class CloudImage {
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
  environmentType: string;

  @property({
    type: 'string'
  })
  description?: string;

  @property({
    type: 'array',
    itemType: 'object'
  })
  protocols: CloudProtocol[];

  constructor(data?: Partial<CloudImage>) {
    Object.assign(this, data);
  }
}
