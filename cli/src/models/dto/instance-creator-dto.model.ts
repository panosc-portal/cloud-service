import { AccountCreatorDto } from './account-creator-dto.model';

export class InstanceCreatorDto {
  name: string;
  description?: string;
  planId: number;
  account: AccountCreatorDto;

  constructor(data?: Partial<InstanceCreatorDto>) {
    Object.assign(this, data);
  }
}
