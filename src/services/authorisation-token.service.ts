import { bind, BindingScope } from '@loopback/core';
import { AuthorisationToken, InstanceMember } from '../models';
import { AuthorisationTokenRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';
import * as uuid from 'uuid/v4';

@bind({ scope: BindingScope.SINGLETON })
export class AuthorisationTokenService extends BaseService<AuthorisationToken, AuthorisationTokenRepository> {
  constructor(@repository(AuthorisationTokenRepository) repo: AuthorisationTokenRepository) {
    super(repo);
  }

  getByToken(token: string): Promise<AuthorisationToken> {
    return this._repository.getByToken(token);
  }

  create(username: string, instanceMember: InstanceMember): Promise<AuthorisationToken> {
    const token = new AuthorisationToken({
      token: uuid(),
      username: username,
      instanceMember: instanceMember
    });

    return this.save(token);
  }
}
