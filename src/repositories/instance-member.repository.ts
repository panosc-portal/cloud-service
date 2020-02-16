import { InstanceMember } from '../models';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';
import { TypeORMDataSource } from '../datasources';

export class InstanceMemberRepository extends BaseRepository<InstanceMember, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, InstanceMember);
  }
}
