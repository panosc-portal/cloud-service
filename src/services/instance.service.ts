import { bind, BindingScope } from '@loopback/core';
import { Instance, User, InstanceMember } from '../models';
import { InstanceRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';
import { inject } from '@loopback/context';
import { InstanceMemberService } from './instance-member.service';
import { IsNull } from 'typeorm';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceService extends BaseService<Instance, InstanceRepository> {
  constructor(@repository(InstanceRepository) repo: InstanceRepository,
    @inject('services.InstanceMemberService') private _instanceMemberService: InstanceMemberService) {
    super(repo);
  }

  async save(object: Instance): Promise<Instance> {
    const instance = await this._repository.save(object);

    await this._instanceMemberService.deleteWhere({instance: IsNull()});

    return instance;
  }

  getAllForUser(user: User): Promise<Instance[]> {
    return this._repository.getAllForUser(user);
  }

  getByIdForUserId(id: number, userId: number): Promise<Instance> {
    return this._repository.getByIdForUserId(id, userId);
  }

  async removeInstanceMember(instance: Instance, instanceMember: InstanceMember): Promise<Instance> {
    if (instance.members == null) {
      return;
    }

    instance.members = instance.members.filter(member => member.user.id !== instanceMember.user.id || member.role !== instanceMember.role);

    await this._instanceMemberService.delete(instanceMember);

    return this.save(instance);
  }

}
