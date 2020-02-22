import { bind, BindingScope } from '@loopback/core';
import { InstanceMember, Instance } from '../models';
import { InstanceMemberRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceMemberService extends BaseService<InstanceMember, InstanceMemberRepository> {
  constructor(@repository(InstanceMemberRepository) repo: InstanceMemberRepository) {
    super(repo);
  }

  getForInstanceId(instanceId: number): Promise<InstanceMember[]> {
    return this._repository.getForInstanceId(instanceId);
  }

  getForUserIdAndInstanceId(userId: number, instanceId: number): Promise<InstanceMember> {
    return this._repository.getForUserIdAndInstanceId(userId, instanceId);
  }

  getInstanceForInstanceMember(instanceMember: InstanceMember): Promise<Instance> {
    return this._repository.getInstanceForInstanceMember(instanceMember);
  }
}
