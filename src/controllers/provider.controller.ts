import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/rest';
import { Provider } from '../models';
import { inject } from '@loopback/context';
import { ProviderService } from '../services';
import { BaseController } from './base.controller';
import { ProviderCreatorDto } from './dto/provider-creator-dto.model';
import { ProviderDto } from './dto/provider-dto.model';

export class ProviderController extends BaseController {
  constructor(@inject('services.ProviderService') private _providerService: ProviderService) {
    super();
  }

  @get('/providers', {
    summary: 'Get a list of all providers',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Provider) }
          }
        }
      }
    }
  })
  getAll(): Promise<Provider[]> {
    return this._providerService.getAll();
  }

  @get('/providers/{id}', {
    summary: 'Get a provider by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Provider)
          }
        }
      }
    }
  })
  async getById(@param.path.string('id') id: number): Promise<Provider> {
    const provider = await this._providerService.getById(id);

    this.throwNotFoundIfNull(provider, 'Provider with given id does not exist');

    return provider;
  }

  @post('/providers', {
    summary: 'Add a provider',
    responses: {
      '201': {
        description: 'Created',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Provider)
          }
        }
      }
    }
  })
  async create(@requestBody() providerCreator: ProviderCreatorDto): Promise<Provider> {
    const provider: Provider = new Provider({
      name: providerCreator.name,
      description: providerCreator.description,
      url: providerCreator.url
    });

    const persistedProvider = await this._providerService.save(provider);

    return persistedProvider;
  }

  @put('/providers/{id}', {
    summary: 'Update an provider by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Provider)
          }
        }
      }
    }
  })
  async update(@param.path.number('id') id: number, @requestBody() providerDto: ProviderDto): Promise<Provider> {
    this.throwBadRequestIfNull(providerDto, 'Provider with given id does not exist');
    this.throwBadRequestIfNotEqual(id, providerDto.id, 'Id in path is not the same as body id');

    const provider = await this._providerService.getById(id);
    this.throwNotFoundIfNull(provider, 'Provider with given id does not exist');

    provider.name = providerDto.name;
    provider.description = providerDto.description ? providerDto.description : provider.description;
    provider.url = providerDto.url;

    return this._providerService.save(provider);
  }

  @del('/providers/{id}', {
    summary: 'Delete a provider by a given identifier',
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async delete(@param.path.string('id') id: number): Promise<boolean> {
    const provider = await this._providerService.getById(id);
    this.throwNotFoundIfNull(provider, 'Provider with given id does not exist');

    return this._providerService.delete(provider);
  }
}
