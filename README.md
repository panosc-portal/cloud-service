# Cloud Service

[![Actions Status](https://github.com/panosc-portal/cloud-service/workflows/Node%20CI/badge.svg)](https://github.com/panosc-portal/cloud-service/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The Cloud Service is a micro-service of the PaNOSC Common Portal.

The Cloud Service performs three main tasks:

 1. It provides a catalogue of data analysis environment Plans (Remote Desktop and Notebook) and currently available Instances (analysis machines).
 2. It works as a proxy to concrete Cloud Providers where the data analysis environments are running.
 3. It provides instance authentication tokens to allow users access to their Remote Desktops and Notebooks through the Desktop and Notebook Services

A data analysis *Plan* is a combination of an *Image* and a *Flavour*: for example a Plan could be a Remote Desktop Image having 2 CPUs and 8GB memory.

The catalogue of Plans is built up from data provided by the Cloud Providers. All metadata associated to Plans and Instances from all providers is stored in a local PostgreSQL database.

A user-initiated request to instantiate a Plan is then forwarded to the relevant provider which will in turn create a container or virtual machine. The IP:PORT of the instance is returned and stored in the Instance table of the Cloud Service database.

To access an instance an authenticated (OpenId Connect) request is made via the API Service to generate a time-limited token for an instance. A user then passes this token through the Desktop or Notebook Services which then validate the token with the Cloud Service from which they obtain the IP and Port of the instance.

Further documentation and the design details can be found at [PaNOSC Portal Cloud Service Design](https://confluence.panosc.eu/x/0gCm) page.

## Installation
```
 npm install
 ```

## Run
```
npm start
```

### Environment variables

The following environment variables are used to configure the Account Service and can be placed in a dotenv file:

| Environment variable | Default value | Usage |
| ---- | ---- | ---- |
| CLOUD_SERVICE_DATABASE_TYPE | | The type of database (eg postgres) |
| CLOUD_SERVICE_DATABASE_HOST | | The host of the database |
| CLOUD_SERVICE_DATABASE_PORT | | The port of the database |
| CLOUD_SERVICE_DATABASE_NAME | | The database name |
| CLOUD_SERVICE_DATABASE_SCHEMA | | The database schema |
| CLOUD_SERVICE_DATABASE_USERNAME | | The database username |
| CLOUD_SERVICE_DATABASE_PASSWORD | | The database password |
| CLOUD_SERVICE_DATABASE_SYNCHRONIZE | false | Automatically generates the database structure |
| CLOUD_SERVICE_DATABASE_LOGGING | false | Provides detailed SQL logging |
| CLOUD_SERVICE_LOG_LEVEL | 'info' | Application logging level |
| CLOUD_SERVICE_TOKEN_VALID_DURATION_S | 10 | The duration of the validity of the authorisation tokens (0 is permanently valid)
| CLOUD_SERVICE_SCHEDULER_ENABLED | true | Specifies whether the scheduler is enabled (removes instances that no longer exist in the cloud provider)
| CLOUD_SERVICE_SCHEDULER_CONFIG | | Specifies the path to the scheduler config file. If not provided the default one in *resources/scheduler.config.json* is used



