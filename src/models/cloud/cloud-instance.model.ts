import { model, property } from '@loopback/repository';
import { CloudInstanceState } from './cloud-instance-state.model';
import { CloudProtocol } from './cloud-protocol.model';
import { CloudFlavour } from './cloud-flavour.model';
import { CloudImage } from './cloud-image.model';
import { CloudInstanceUser } from './cloud-instance-user.model';

@model()
export class CloudInstance {
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
    type: 'string'
  })
  hostname: string;

  @property({
    type: 'string'
  })
  computeId: string;

  @property({
    type: 'date'
  })
  createdAt: Date;

  @property({
    type: 'date'
  })
  updatedAt: Date;

  @property({
    type: 'array',
    itemType: 'object'
  })
  protocols: CloudProtocol[];

  @property({
    type: CloudFlavour
  })
  flavour: CloudFlavour;

  @property({
    type: CloudImage
  })
  image: CloudImage;

  @property({
    type: CloudInstanceUser
  })
  user: CloudInstanceUser;

  @property({
    type: CloudInstanceState
  })
  state: CloudInstanceState;

  constructor(data?: Partial<CloudInstance>) {
    Object.assign(this, data);
  }
}
