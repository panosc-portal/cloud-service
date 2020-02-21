import { model, property } from '@loopback/repository';

@model()
export class AuthorisationTokenCreatorDto {
  @property({ type: 'string' })
  username: string;

  constructor(data?: Partial<AuthorisationTokenCreatorDto>) {
    Object.assign(this, data);
  }
}
