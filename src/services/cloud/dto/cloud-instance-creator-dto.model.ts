import { CloudInstanceUser } from "../../../models";

export class CloudInstanceCreatorDto {
  name: string;
  description: string;
  imageId: number;
  flavourId: number;
  user: CloudInstanceUser;

  constructor(data?: Partial<CloudInstanceCreatorDto>) {
    Object.assign(this, data);
  }
}
