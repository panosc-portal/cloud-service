import { bind, BindingScope } from '@loopback/core';
import { inject } from '@loopback/context';
import { CloudImage } from '../../models';
import { CloudApiClientService } from './cloud-api-client.service';
import { CloudService } from './cloud.service';
import { PanoscCommonTsComponentBindings, ILogger } from '@panosc-portal/panosc-common-ts';

@bind({ scope: BindingScope.SINGLETON })
export class CloudImageService extends CloudService<CloudImage> {
  constructor(
    @inject('services.CloudApiClientService') cloudApiClientService: CloudApiClientService,
    @inject(PanoscCommonTsComponentBindings.LOGGER) _logger: ILogger) {
      super(cloudApiClientService, 'images', _logger);
  }
}
