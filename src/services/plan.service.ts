import { bind, BindingScope } from '@loopback/core';
import { Plan } from '../models';
import { PlanRepository } from '../repositories';
import { repository } from '@loopback/repository';
import { BaseService } from './base.service';

@bind({ scope: BindingScope.SINGLETON })
export class PlanService extends BaseService<Plan, PlanRepository> {
  constructor(@repository(PlanRepository) repo: PlanRepository) {
    super(repo);
  }
}
