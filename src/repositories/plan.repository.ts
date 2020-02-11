import { Plan } from '../models';
import { inject } from '@loopback/core';
import { BaseRepository } from './base.repository';
import { TypeORMDataSource } from '../datasources';

export class PlanRepository extends BaseRepository<Plan, number> {
  constructor(@inject('datasources.typeorm') dataSource: TypeORMDataSource) {
    super(dataSource, Plan);
  }

  getByProviderIdAndImageId(providerId: number, imageId: number): Promise<Plan[]> {
    return super.find({ where: {provider: { id: providerId }, imageId: imageId }, order: {id: 'ASC'} });
  }
}
