import { bind, BindingScope } from '@loopback/core';
import { Provider } from '../models';
import { ProviderRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class ProviderService extends BaseService<Provider, ProviderRepository> {
  constructor(@repository(ProviderRepository) repo: ProviderRepository) {
    super(repo);
  }
}
