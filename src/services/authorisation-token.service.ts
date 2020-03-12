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

  create(instanceMember: InstanceMember): Promise<AuthorisationToken> {
    const token = new AuthorisationToken({
      token: uuid(),
      instanceMember: instanceMember,
      createdAtMs: (new Date).getTime()
    });

    return this.save(token);
  }

  async validate(instanceId: number, token: string): Promise<InstanceAuthorisation> {
    const authorisationToken = await this.getByToken(token);
    const instance = await this._instanceMemberService.getInstanceForInstanceMember(authorisationToken.instanceMember);

    if (authorisationToken == null) {
      return null;
    }

    if (instance.id !== instanceId) {
      throw new TokenInvalidError(`Token ${token} is not valid for the instance ${instanceId}`);

    } else if (!authorisationToken.isTimeValid(APPLICATION_CONFIG().authorisation.tokenValidDurationS)) {
      throw new TokenInvalidError(`Token ${token} is not longer valid`);

    } else {

      return new InstanceAuthorisation({
        instanceMember: authorisationToken.instanceMember,
      });
    }
  }
}
