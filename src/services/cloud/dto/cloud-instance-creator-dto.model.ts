import { CloudInstanceAccount } from '../../../models';

export class CloudInstanceCreatorDto {
  name: string;
  description: string;
  imageId: number;
  flavourId: number;
  account: CloudInstanceAccount;

  constructor(data?: Partial<CloudInstanceCreatorDto>) {
    Object.assign(this, data);
  }
}
