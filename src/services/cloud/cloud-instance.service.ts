import { bind, BindingScope } from '@loopback/core';
import { inject } from '@loopback/context';
import { CloudInstance, Provider } from '../../models';
import { CloudApiClientService } from './cloud-api-client.service';
import { CloudService } from './cloud.service';
import { CloudInstanceCreatorDto, CloudInstanceUpdatorDto } from './dto';
import { logger } from '../../utils';

@bind({ scope: BindingScope.SINGLETON })
export class CloudInstanceService extends CloudService<CloudInstance> {
  constructor(@inject('services.CloudApiClientService') cloudApiClientService: CloudApiClientService) {
    super(cloudApiClientService, 'instances');
  }

  async save(cloudInstanceCreatorDto: CloudInstanceCreatorDto, provider: Provider): Promise<CloudInstance> {
    try {
      const response = await this._apiClient(provider).post(`${this._baseUrl}`, cloudInstanceCreatorDto);
      const instance: CloudInstance = response.data;
      return instance;

    } catch (error) {
      logger.error(`Got error creating instance at ${this._baseUrl} from provider '${provider.name}': ${error}`);
      throw error;
    }
  }

  async update(cloudInstanceUpdatorDto: CloudInstanceUpdatorDto, provider: Provider): Promise<CloudInstance> {
    try {
      const response = await this._apiClient(provider).put(`${this._baseUrl}`, cloudInstanceUpdatorDto);
      const instance: CloudInstance = response.data;
      return instance;

    } catch (error) {
      logger.error(`Got error updating instance at ${this._baseUrl} from provider '${provider.name}': ${error}`);
      throw error;
    }
  }

  async delete(cloudInstanceId: number, provider: Provider): Promise<boolean> {
    try {
      const response = await this._apiClient(provider).delete(`${this._baseUrl}/${cloudInstanceId}`);
      const deleted: boolean = response.data;
      return deleted;

    } catch (error) {
      logger.error(`Got error updating instance at ${this._baseUrl} from provider '${provider.name}': ${error}`);
      throw error;
    }
  }
}
