import { User, Pagination } from '../models';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';
import { TypeORMDataSource } from '../datasources';
import { Like } from 'typeorm';

export class UserRepository extends BaseRepository<User, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, User);
  }

  getAllLikeLastName(lastName: string, pagination?: Pagination): Promise<User[]> {
    const options = {
      where: {
        lastName: Like(`${lastName}%`)
      },
      take: pagination ? pagination.limit : undefined,
      skip: pagination ? pagination.offset : undefined
    }

    return super.getAll(options);
  }
}
