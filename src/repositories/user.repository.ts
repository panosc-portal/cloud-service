import { User, Pagination } from '../models';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';
import { TypeORMDataSource } from '../datasources';
import { Like } from 'typeorm';

export class UserRepository extends BaseRepository<User, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, User);
  }
}
