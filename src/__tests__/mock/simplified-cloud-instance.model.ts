import { CloudProtocol, CloudInstanceState, CloudInstanceAccount } from '../../models';

export class SimplifiedCloudInstance {
  id: number;
  name: string;
  description?: string;
  hostname: string;
  createdAt: Date;
  protocols: CloudProtocol[];
  flavourId: number;
  imageId: number;
  account: CloudInstanceAccount;
  state: CloudInstanceState;

  constructor(data?: Partial<SimplifiedCloudInstance>) {
    Object.assign(this, data);
  }
}
