import { bind, BindingScope } from '@loopback/core';
import { inject } from '@loopback/context';
import { CloudFlavour } from '../../models';
import { CloudApiClientService } from './cloud-api-client.service';
import { CloudService } from './cloud.service';

@bind({ scope: BindingScope.SINGLETON })
export class CloudFlavourService extends CloudService<CloudFlavour> {
  constructor(@inject('services.CloudApiClientService') cloudApiClientService: CloudApiClientService) {
    super(cloudApiClientService, 'flavours');
  }
}
