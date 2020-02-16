import { bind, BindingScope } from '@loopback/core';
import { User, Pagination } from '../models';
import { UserRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class UserService extends BaseService<User, UserRepository> {
  constructor(@repository(UserRepository) repo: UserRepository) {
    super(repo);
  }

  getAllLikeLastName(lastName: string, pagination?: Pagination): Promise<User[]> {
    return this._repository.getAllLikeLastName(lastName, pagination);
  }

}
