import { bind, BindingScope } from '@loopback/core';
import { Provider, CloudImage } from '../../models';
import * as request from 'request-promise-native';
import { logger } from '../../utils';

@bind({ scope: BindingScope.SINGLETON })
export class CloudImageService {
  constructor() {}

  async getAll(provider: Provider): Promise<CloudImage[]> {
    const options = {
      uri: `${provider.url}/images`
    };

    try {
      const cloudImages: CloudImage[] = await request.get(options);
      return cloudImages;

    } catch (error) {
      logger.error(`Got error getting images from provider '${provider.name}'`);
      return null;
    }
  }

  async getById(cloudImageId: number, provider: Provider): Promise<CloudImage> {
    const options = {
      uri: `${provider.url}/images/${cloudImageId}`
    };

    try {
      const cloudImage: CloudImage = await request.get(options);
      return cloudImage;

    } catch (error) {
      logger.error(`Got error getting image with id '${cloudImageId}' from provider '${provider.name}'`);
      return null;
    }
  }
}
