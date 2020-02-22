import { bind, BindingScope, inject } from '@loopback/core';
import { TypeORMDataSource } from '../datasources';
import { Health } from '../models';

@bind({ scope: BindingScope.SINGLETON })
export class HealthService {
  constructor(@inject('datasources.typeorm') private _dbDataSource: TypeORMDataSource) {}

  async getHealth(): Promise<Health> {
    const dbConnection = await this._dbDataSource.connection();
    const dbConnected = dbConnection.isConnected;

    if (dbConnected) {
      return Health.UP;

    } else {
      return Health.DOWN;
    }
  }
}
