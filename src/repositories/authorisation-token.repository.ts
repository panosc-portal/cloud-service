import { AuthorisationToken } from '../models';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';
import { TypeORMDataSource } from '../datasources';

export class AuthorisationTokenRepository extends BaseRepository<AuthorisationToken, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, AuthorisationToken);
  }

  getByToken(token: string): Promise<AuthorisationToken> {
    return super.getOne({ where: { token: token } });
  }
}
