import { CloudProtocol, CloudInstanceState } from '../../models';
import { CloudInstanceUser } from '../../models/cloud/cloud-instance-user.model';

export class SimplifiedCloudInstance {
  id: number;
  name: string;
  description?: string;
  hostname: string;
  createdAt: Date;
  protocols: CloudProtocol[];
  flavourId: number;
  imageId: number;
  user?: CloudInstanceUser;
  state: CloudInstanceState;

  constructor(data?: Partial<SimplifiedCloudInstance>) {
    Object.assign(this, data);
  }
}
