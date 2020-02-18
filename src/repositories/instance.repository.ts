import { Instance, User } from '../models';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';
import { TypeORMDataSource } from '../datasources';
import { In } from 'typeorm';

export class InstanceRepository extends BaseRepository<Instance, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Instance);
  }

  find(): Promise<Instance[]> {
    return super.find({ where: { deleted: false }, order: { id: 'DESC' } });
  }

  async findAllForUser(user: User): Promise<Instance[]> {
    // Has to be done in two calls because if we do a single query with a constraint on the userId, we only get one member returned for all instances
    const queryBuilder = super.createQueryBuilder('instance');

    // Get all instance Ids
    const instanceIds = (await queryBuilder
      .select('instance.id')
      .innerJoin('instance.members', 'member')
      .leftJoin('member.user', 'user')
      .where({deleted: false})
      .andWhere('user.id = :userId', {userId: user.id})
      .getMany())
      .map(data => data.id);

    // Get full instances
    return super.find({where: {id: In(instanceIds)}, order: { id: 'DESC' }});
  }

  async findByIdForUser(id: number, user: User): Promise<Instance> {
    // Has to be done in two calls because if we do a single query with a constraint on the userId, we only get one member returned for all instances
    const queryBuilder = super.createQueryBuilder('instance');

    // Get all instance Ids
    const instanceIds = (await queryBuilder
      .select('instance.id')
      .innerJoin('instance.members', 'member')
      .leftJoin('member.user', 'user')
      .where({deleted: false})
      .andWhere('user.id = :userId', {userId: user.id})
      .getMany())
      .map(data => data.id);

    if (instanceIds.includes(id)) {
      return super.findById(id);

    } else {
      return null;
    }
  }
}
