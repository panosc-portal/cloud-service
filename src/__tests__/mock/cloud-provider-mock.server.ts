import * as express from 'express';
import { lifeCycleObserver } from '@loopback/core';
import { buildLogger } from '../../utils';
import { CloudImage, CloudFlavour, CloudInstance } from '../../models';
import { cloudProviderData, CloudProviderMockServerData } from './cloud-provider-data';

const logger = buildLogger('[Cloud Provider Mock Server]', 240);

@lifeCycleObserver('server')
export class CloudProviderMockServer {
  private _server = null;

  port: number;
  images: CloudImage[] = [];
  flavours: CloudFlavour[] = [];
  instances: CloudInstance[] = [];

  constructor(private _serverData: CloudProviderMockServerData) {
    this.port = this._serverData.port;
  }

  start() {
    if (this._server != null) {
      return;
    }

    this.images = this._serverData.images;
    this.flavours = this._serverData.flavours;
    this.instances = this._serverData.instances;

    const app = express();

    app.get('/api/v1/flavours', (req, res) => {
      logger.info(`${req.protocol}://${req.get('host')}${req.originalUrl}`);

      res.status(200).send(this.flavours);
    });

    app.get('/api/v1/images', (req, res) => {
      logger.info(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
      res.status(200).send(this.images);
    });

    this._server = app.listen(this.port, () => logger.info(`Cloud Provider Mock Server listening on port ${this.port}`));
  }

  stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this._server != null) {
        this._server.close((error: Error) => {
          if (error) {
            reject(error);

          } else {
            resolve();
          }
        });
        this._server = null;

        logger.info(`Cloud Provider Mock Server stopped with port ${this.port}`);
      }
    });
  }
}

export function startCloudProviderMockServers() {
  const servers = cloudProviderData.map(serverData => {
    const server = new CloudProviderMockServer(serverData);
    server.start();
    return server;
  })

  return servers;
}

export function stopCloudProviderMockServers(servers: CloudProviderMockServer[]): Promise<any> {
  return Promise.all(servers.map(server => server.stop()));
}
