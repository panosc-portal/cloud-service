import { InstanceMember, User, Instance } from '../models';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';
import { TypeORMDataSource } from '../datasources';

export class InstanceMemberRepository extends BaseRepository<InstanceMember, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, InstanceMember);
  }

  async getForUserAndInstance(user: User, instance: Instance): Promise<InstanceMember> {
    const queryBuilder = await super.createQueryBuilder('instanceMember');

    const instanceMember = await queryBuilder
      .innerJoinAndSelect('instanceMember.user', 'user')
      .innerJoin('instanceMember.instance', 'instance')
      .andWhere('user.id = :userId', {userId: user.id})
      .andWhere('instance.id = :instanceId', {instanceId: instance.id})
      .getOne();

    return instanceMember;
  }

  async getInstanceForInstanceMember(instanceMember: InstanceMember): Promise<Instance> {
    const queryBuilder = await super.createQueryBuilder('instanceMember');

    const instanceMemberWithInstance = await queryBuilder
      .innerJoinAndSelect('instanceMember.instance', 'instance')
      .andWhere('instanceMember.id = :id', {id: instanceMember.id})
      .getOne();

    return instanceMemberWithInstance.instance;
  }
}
