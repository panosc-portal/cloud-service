import { AxiosInstance } from 'axios';
import { Provider } from '../../models';
import { logger } from '../../utils';
import { CloudApiClientService } from './cloud-api-client.service';

export class CloudService<T> {
  constructor(protected _cloudApiClientService: CloudApiClientService, protected _baseUrl: string) {}

  protected _apiClient(provider: Provider): AxiosInstance {
    return this._cloudApiClientService.getApiClient(provider);
  }

  async getAll(provider: Provider): Promise<T[]> {
    try {
      const response = await this._apiClient(provider).get(`${this._baseUrl}`);
      const elements: T[] = response.data;
      return elements;

    } catch (error) {
      logger.error(`Got error getting ${this._baseUrl} from provider '${provider.name}': ${error}`);
      throw error;
    }
  }

  async getById(elementId: number, provider: Provider): Promise<T> {
    try {
      const response = await this._apiClient(provider).get(`${this._baseUrl}/${elementId}`);
      const element: T = response.data;
      return element;

    } catch (error) {
      logger.error(`Got error getting element from ${this._baseUrl} with id '${elementId}' from provider '${provider.name}': ${error}`);
      throw error;
    }
  }
}
