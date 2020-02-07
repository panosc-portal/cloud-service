import { Provider } from '../models';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';
import { TypeORMDataSource } from '../datasources';

export class ProviderRepository extends BaseRepository<Provider, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Provider);
  }
}
