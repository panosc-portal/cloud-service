import { bind, BindingScope } from '@loopback/core';
import { inject } from '@loopback/context';
import { CloudImage } from '../../models';
import { CloudApiClientService } from './cloud-api-client.service';
import { CloudService } from './cloud.service';

@bind({ scope: BindingScope.SINGLETON })
export class CloudImageService extends CloudService<CloudImage> {
  constructor(@inject('services.CloudApiClientService') cloudApiClientService: CloudApiClientService) {
    super(cloudApiClientService, 'images');
  }
}
