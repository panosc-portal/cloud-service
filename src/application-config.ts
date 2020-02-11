export class ApplicationConfig {
  database: {
    type: string;
    host: string;
    port: string;
    userName: string;
    password: string;
    name: string;
    schema: string;
    synchronize: boolean;
    logging: boolean;
  };

  logging: {
    level: string;
  };

  scheduler: {
    enabled: boolean;
    config: string;
  };

  constructor(data?: Partial<ApplicationConfig>) {
    Object.assign(this, data);
  }
}

let applicationConfig: ApplicationConfig;

export function APPLICATION_CONFIG(): ApplicationConfig {
  if (applicationConfig == null) {
    applicationConfig = {
      database: {
        type: process.env.CLOUD_SERVICE_DATABASE_TYPE,
        host: process.env.CLOUD_SERVICE_DATABASE_HOST,
        port: process.env.CLOUD_SERVICE_DATABASE_PORT,
        userName: process.env.CLOUD_SERVICE_DATABASE_USERNAME,
        password: process.env.CLOUD_SERVICE_DATABASE_PASSWORD,
        name: process.env.CLOUD_SERVICE_DATABASE_NAME,
        schema: process.env.CLOUD_SERVICE_DATABASE_SCHEMA,
        synchronize: process.env.CLOUD_SERVICE_DATABASE_SYNCHRONIZE === 'true',
        logging: process.env.CLOUD_SERVICE_DATABASE_LOGGING === 'true'
      },
      logging: {
        level: process.env.CLOUD_SERVICE_LOG_LEVEL
      },
      scheduler: {
        enabled:
          process.env.CLOUD_SERVICE_SCHEDULER_ENABLED != null
            ? process.env.CLOUD_SERVICE_SCHEDULER_CONFIG === 'true'
            : true,
        config: process.env.CLOUD_SERVICE_SCHEDULER_CONFIG
      }
    };
  }

  return applicationConfig;
}
