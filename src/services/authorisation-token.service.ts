import { bind, BindingScope } from '@loopback/core';
import { AuthorisationToken, InstanceMember, InstanceAuthorisation } from '../models';
import { AuthorisationTokenRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';
import * as uuid from 'uuid/v4';
import { APPLICATION_CONFIG } from '../application-config';
import { TokenInvalidError } from '../utils';
import { inject } from '@loopback/context';
import { InstanceMemberService } from './instance-member.service';

@bind({ scope: BindingScope.SINGLETON })
export class AuthorisationTokenService extends BaseService<AuthorisationToken, AuthorisationTokenRepository> {
  constructor(
    @repository(AuthorisationTokenRepository) repo: AuthorisationTokenRepository,
    @inject('services.InstanceMemberService') private _instanceMemberService: InstanceMemberService) {
    super(repo);
  }

  getByToken(token: string): Promise<AuthorisationToken> {
    return this._repository.getByToken(token);
  }

  create(username: string, instanceMember: InstanceMember): Promise<AuthorisationToken> {
    const token = new AuthorisationToken({
      token: uuid(),
      username: username,
      instanceMember: instanceMember,
      createdAtMs: (new Date).getTime()
    });

    return this.save(token);
  }

  async validate(instanceId: number, token: string): Promise<InstanceAuthorisation> {
    const authorisationToken = await this.getByToken(token);

    if (authorisationToken == null) {
      return null;
    }

    // Get instance of instance member associated to token
    const instance = await this._instanceMemberService.getInstanceForInstanceMember(authorisationToken.instanceMember);

    if (instance.id !== instanceId) {
      throw new TokenInvalidError(`Token ${token} is not valid for the given instance`);

    } else if (!authorisationToken.isTimeValid(APPLICATION_CONFIG().authorisation.tokenValidDurationS)) {
      throw new TokenInvalidError(`Token ${token} is not longer valid`);

    } else {

      return new InstanceAuthorisation({
        instance: instance,
        instanceMember: authorisationToken.instanceMember,
        username: authorisationToken.username
      });
    }
  }
}
