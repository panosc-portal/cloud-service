import { TypeORMDataSource } from '../../../datasources';
import {createTestApplicationContext, TestApplicationContext} from '../../helpers/context.helper';

export const testDataSource = setupDataSource();

export function setupDataSource(): TypeORMDataSource {
  const context: TestApplicationContext = createTestApplicationContext();
  const dataSource = new TypeORMDataSource(context.logger);

  return dataSource;
}
