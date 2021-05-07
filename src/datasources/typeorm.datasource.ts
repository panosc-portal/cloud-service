import { Connection, createConnection, EntityManager, ObjectType, Repository } from 'typeorm';
import { lifeCycleObserver, LifeCycleObserver, inject } from '@loopback/core';
import { APPLICATION_CONFIG } from '../application-config';
import { PanoscCommonTsComponentBindings, ILogger } from '@panosc-portal/panosc-common-ts';

@lifeCycleObserver('datasource')
export class TypeORMDataSource implements LifeCycleObserver {
  static dataSourceName = 'typeorm';

  private _config: any;
  private _connection: Connection;
  private _connectionPromise: Promise<Connection>;

  constructor(@inject(PanoscCommonTsComponentBindings.LOGGER) private _logger: ILogger) {
    this._config = {
      type: APPLICATION_CONFIG().database.type,
      host: APPLICATION_CONFIG().database.host,
      port: APPLICATION_CONFIG().database.port,
      username: APPLICATION_CONFIG().database.userName,
      password: APPLICATION_CONFIG().database.password,
      database: APPLICATION_CONFIG().database.name,
      schema: APPLICATION_CONFIG().database.schema,
      entities: ['dist/models/*.js'],
      synchronize: APPLICATION_CONFIG().database.synchronize,
      logging: APPLICATION_CONFIG().database.logging
    };
  }

  /**
   * Start the datasource when application is started
   */
  async start(): Promise<void> {
    this._logger.info('Initialising database connection');
    await this.connection();
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  async stop(): Promise<void> {
    if (this._connection) {
      this._logger.info('Closing database connection');
      await this._connection.close();
      this._connection = null;
      this._connectionPromise = null;
    }
  }

  async connection(): Promise<Connection> {
    try {
      let connection = this._connection;
      if (connection == null && this._connectionPromise == null) {
        this._connectionPromise = createConnection(this._config);
        connection = this._connection = await this._connectionPromise;
        this._connectionPromise = null;

      } else if (connection == null && this._connectionPromise != null) {
        connection = await this._connectionPromise;
      }

      return connection;
    } catch (error) {
      this._logger.error(`Could not connect to the database : ${error.message}`);
      process.exit();
    }
  }

  async entityManager(): Promise<EntityManager> {
    const connection = await this.connection();
    return connection.manager;
  }

  async repository<T>(entityClass: ObjectType<T>): Promise<Repository<T>> {
    const connection = await this.connection();
    return connection.getRepository(entityClass);
  }
}
