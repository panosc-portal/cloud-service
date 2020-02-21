import { model, property } from '@loopback/repository';

@model()
export class AuthorisationTokenDto {
  @property({ type: 'string' })
  token: string;

  constructor(data?: Partial<AuthorisationTokenDto>) {
    Object.assign(this, data);
  }
}
