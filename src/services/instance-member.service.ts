import { bind, BindingScope } from '@loopback/core';
import { InstanceMember } from '../models';
import { InstanceMemberRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class InstanceMemberService extends BaseService<InstanceMember, InstanceMemberRepository> {
  constructor(@repository(InstanceMemberRepository) repo: InstanceMemberRepository) {
    super(repo);
  }
}
