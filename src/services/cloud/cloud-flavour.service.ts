import { bind, BindingScope } from '@loopback/core';
import { Provider, CloudFlavour } from '../../models';
import * as request from 'request-promise-native';
import { logger } from '../../utils';

@bind({ scope: BindingScope.SINGLETON })
export class CloudFlavourService {
  constructor() {}

  async getAll(provider: Provider): Promise<CloudFlavour[]> {
    const options = {
      uri: `${provider.url}/flavours`
    };

    try {
      const cloudFlavours: CloudFlavour[] = await request.get(options);
      return cloudFlavours;

    } catch (error) {
      logger.error(`Got error getting flavours from provider '${provider.name}'`);
      return null;
    }
  }

  async getById(cloudFlavourId: number, provider: Provider): Promise<CloudFlavour> {
    const options = {
      uri: `${provider.url}/flavours/${cloudFlavourId}`
    };

    try {
      const cloudFlavour: CloudFlavour = await request.get(options);
      return cloudFlavour;

    } catch (error) {
      logger.error(`Got error getting flavour with id '${cloudFlavourId}' from provider '${provider.name}'`);
      return null;
    }
  }
}
