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

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._server != null) {
        return;
      }

      this.images = this._serverData.images;
      this.flavours = this._serverData.flavours;
      this.instances = this._serverData.instances;

      const app = express();

      app.use((req, res, next) => {
        logger.info(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        next();
      })

      app.get('/api/v1/flavours', (req, res) => {
        res.status(200).send(this.flavours);
      });

      app.get('/api/v1/flavours/:flavourId', (req, res) => {
        const flavourId = +req.params.flavourId;
        const flavour = this.flavours.find(flavour => flavour.id === flavourId);
        if (flavour != null) {
          res.status(200).send(flavour);

        } else {
          return res.status(404);
        }
      });

      app.get('/api/v1/images', (req, res) => {
        res.status(200).send(this.images);
      });

      app.get('/api/v1/images/:imageId', (req, res) => {
        const imageId = +req.params.imageId;
        const image = this.images.find(image => image.id === imageId);
        if (image != null) {
          res.status(200).send(image);

        } else {
          return res.status(404);
        }
      });

      this._server = app.listen(this.port, (error) => {
        if (error) {
          logger.error(`Failed to start Cloud Provider Mock Server on poirt ${this.port}: ${error}`);

        } else {
          logger.info(`Cloud Provider Mock Server listening on port ${this.port}`)
          resolve();
        }
      });
    });
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

export function cloudProviderMockServers(): CloudProviderMockServer[] {
  return cloudProviderData.map(serverData => new CloudProviderMockServer(serverData));
}

export function startCloudProviderMockServers(servers: CloudProviderMockServer[]): Promise<any> {
  return Promise.all(servers.map(server => server.start()));
}

export function stopCloudProviderMockServers(servers: CloudProviderMockServer[]): Promise<any> {
  return Promise.all(servers.map(server => server.stop()));
}
