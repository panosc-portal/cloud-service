import { bind, BindingScope } from '@loopback/core';
import { inject } from '@loopback/context';
import { CloudInstance } from '../../models';
import { CloudApiClientService } from './cloud-api-client.service';
import { CloudService } from './cloud.service';

@bind({ scope: BindingScope.SINGLETON })
export class CloudInstanceService extends CloudService<CloudInstance> {
  constructor(@inject('services.CloudApiClientService') cloudApiClientService: CloudApiClientService) {
    super(cloudApiClientService, 'instances');
  }
}
