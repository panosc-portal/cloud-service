import { bind, BindingScope } from '@loopback/core';
import { InstanceMember, User, Instance } from '../models';
import { InstanceMemberRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceMemberService extends BaseService<InstanceMember, InstanceMemberRepository> {
  constructor(@repository(InstanceMemberRepository) repo: InstanceMemberRepository) {
    super(repo);
  }

  getForUserAndInstance(user: User, instance: Instance): Promise<InstanceMember> {
    return this._repository.getForUserAndInstance(user, instance);
  }

  getInstanceForInstanceMember(instanceMember: InstanceMember): Promise<Instance> {
    return this._repository.getInstanceForInstanceMember(instanceMember);
  }
}
