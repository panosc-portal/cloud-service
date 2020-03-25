import { bind, BindingScope } from '@loopback/core';
import { User } from '../models';
import { UserRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class UserService extends BaseService<User, UserRepository> {
  constructor(@repository(UserRepository) repo: UserRepository) {
    super(repo);
  }
}
