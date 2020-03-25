import { bind, BindingScope } from '@loopback/core';
import Axios, { AxiosInstance } from 'axios';
import { Provider } from '../../models';

@bind({ scope: BindingScope.SINGLETON })
export class CloudApiClientService {
  private _clients = new Map<number, AxiosInstance>();

  constructor() {}

  getApiClient(provider: Provider): AxiosInstance {
    let client = this._clients.get(provider.id);
    if (client == null) {
      client = Axios.create({
        baseURL: provider.url,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this._clients.set(provider.id, client);
    }

    return client;
  }
}
