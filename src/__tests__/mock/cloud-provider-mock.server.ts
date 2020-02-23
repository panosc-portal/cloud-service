import * as express from 'express';
import { lifeCycleObserver } from '@loopback/core';
import { buildLogger } from '../../utils';
import { CloudImage, CloudFlavour, CloudInstance, CloudInstanceState, CloudProtocol, CloudInstanceCommand, CloudInstanceCommandType } from '../../models';
import { cloudProviderData, CloudProviderMockServerData } from './cloud-provider-data';
import { CloudInstanceCreatorDto, CloudInstanceUpdatorDto } from '../../services';

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
      this.instances = this._serverData.instances.map(simplifiedInstance => new CloudInstance({
        id: simplifiedInstance.id,
        name: simplifiedInstance.name,
        description: simplifiedInstance.description,
        hostname: simplifiedInstance.hostname,
        protocols: simplifiedInstance.protocols,
        image: this.images.find(image => image.id === simplifiedInstance.imageId),
        flavour: this.flavours.find(flavour => flavour.id === simplifiedInstance.flavourId),
        createdAt: simplifiedInstance.createdAt,
        state: new CloudInstanceState(simplifiedInstance.state),
        user: simplifiedInstance.user
      }));

      const app = express();
      app.use(express.json());

      app.use((req, res, next) => {
        logger.info(`[${req.method}] ${req.protocol}://${req.get('host')}${req.originalUrl}`);
        next();
      })

      app.get('/api/v1/flavours', (req, res) => {
        res.status(200).send(this.flavours);
      });

      app.get('/api/v1/flavours/:flavourId', (req, res) => {
        const flavourId = +req.params.flavourId;
        const flavour = this.flavours.find(aFlavour => aFlavour.id === flavourId);
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
        const image = this.images.find(anImage => anImage.id === imageId);
        if (image != null) {
          res.status(200).send(image);

        } else {
          return res.status(404);
        }
      });

      app.get('/api/v1/instances', (req, res) => {
        res.status(200).send(this.instances);
      });

      app.get('/api/v1/instances/:instanceId', (req, res) => {
        const instanceId = +req.params.instanceId;
        const instance = this.instances.find(anInstance => anInstance.id === instanceId);
        if (instance != null) {
          res.status(200).send(instance);

        } else {
          return res.status(404);
        }
      });

      app.post('/api/v1/instances', (req, res) => {
        const instanceCreatorDto = req.body as CloudInstanceCreatorDto;

        // Validate image Id and flavour Id
        const image = this.images.find(anImage => anImage.id === instanceCreatorDto.imageId);
        const flavour = this.flavours.find(aFlavour => aFlavour.id === instanceCreatorDto.flavourId);

        if (image == null) {
          return res.status(400).send(`Image not found with id ${instanceCreatorDto.imageId}`);

        } else if (image == null) {
          return res.status(400).send(`Image not found with id ${instanceCreatorDto.imageId}`);

        } else {
          const instance = new CloudInstance({
            id: this.instances.length + 1,
            name: instanceCreatorDto.name,
            description: instanceCreatorDto.description,
            image: image,
            flavour: flavour,
            createdAt: new Date(),
            hostname: `instance${this.instances.length + 1}.host.eu`,
            user: instanceCreatorDto.user,
            state: new CloudInstanceState({
              cpu: flavour.cpu,
              memory: flavour.memory,
              message: '',
              status: 'BUILDING'
            }),
            protocols: image.protocols.map(protocol => new CloudProtocol({name: protocol.name, port: 30000 + Math.round(Math.random() * 2767)}))
          })

          this.instances.push(instance);
          return res.status(200).send(instance);
        }
      });

      app.put('/api/v1/instances/:instanceId', (req, res) => {
        const instanceUpdatorDto = req.body as CloudInstanceUpdatorDto;

        const instanceId = +req.params['instanceId'];

        const instance = this.instances.find(anInstance => anInstance.id === instanceId);

        // Validate instance and Id
        if (instance == null) {
          return res.status(404).send(`Instance not found with id ${instanceUpdatorDto.id}`);

        } else if (instanceUpdatorDto.id !== instanceId) {
          return res.status(400).send(`instanceId path parameter does not match body instance id`);

        } else {
          instance.name = instanceUpdatorDto.name == null ? instance.name : instanceUpdatorDto.name;
          instance.description = instanceUpdatorDto.description == null ? instance.description : instanceUpdatorDto.description;

          return res.status(200).send(instance);
        }
      });

      app.delete('/api/v1/instances/:instanceId', (req, res) => {
        const instanceId = +req.params['instanceId'];

        const instance = this.instances.find(anInstance => anInstance.id === instanceId);

        // Validate instance and Id
        if (instance == null) {
          return res.status(404).send(`Instance not found with id ${instanceId}`);

        } else {
          this.instances = this.instances.filter(anInstance => anInstance.id !== instance.id);

          return res.status(200).send(true);
        }
      });

      app.get('/api/v1/instances/:instanceId/state', (req, res) => {
        const instanceId = +req.params.instanceId;
        const instance = this.instances.find(anInstance => anInstance.id === instanceId);
        if (instance != null) {
          res.status(200).send(instance.state);

        } else {
          return res.status(404);
        }
      });


      app.post('/api/v1/instances/:instanceId/actions', (req, res) => {
        const cloudInstanceCommand = req.body as CloudInstanceCommand;

        const instanceId = +req.params['instanceId'];

        const instance = this.instances.find(anInstance => anInstance.id === instanceId);

        // Validate instance and Id
        if (instance == null) {
          return res.status(404).send(`Instance not found with id ${instanceId}`);

        } else {
          if (cloudInstanceCommand.type === CloudInstanceCommandType.REBOOT) {
            instance.state.status = 'REBOOTING';
          } else if (cloudInstanceCommand.type === CloudInstanceCommandType.SHUTDOWN) {
            instance.state.status = 'STOPPING';
          } else if (cloudInstanceCommand.type === CloudInstanceCommandType.START) {
            instance.state.status = 'STARTING';
          }

          return res.status(200).send(instance);
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
