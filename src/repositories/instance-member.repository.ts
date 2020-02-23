import { InstanceMember, Instance } from '../models';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';
import { TypeORMDataSource } from '../datasources';

export class InstanceMemberRepository extends BaseRepository<InstanceMember, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, InstanceMember);
  }

  async getForInstanceId(instanceId: number): Promise<InstanceMember[]> {
    const queryBuilder = await super.createQueryBuilder('instanceMember');

    const instanceMembers = await queryBuilder
      .innerJoinAndSelect('instanceMember.user', 'user')
      .andWhere('instance_id = :instanceId', {instanceId: instanceId})
      .getMany();

    return instanceMembers;
  }

  async getForUserIdAndInstanceId(userId: number, instanceId: number): Promise<InstanceMember> {
    const queryBuilder = await super.createQueryBuilder('instanceMember');

    const instanceMember = await queryBuilder
      .innerJoinAndSelect('instanceMember.user', 'user')
      .andWhere('user.id = :userId', {userId: userId})
      .andWhere('instance_id = :instanceId', {instanceId: instanceId})
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
