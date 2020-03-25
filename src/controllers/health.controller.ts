import { inject } from '@loopback/context';
import { HealthService } from '../services';
import { get } from '@loopback/openapi-v3';
import { Health } from '../models';

export class HealthController {
  constructor(@inject('services.HealthService') private _healthservice: HealthService) {}

  @get('/health', {
    "tags": [
      "Health"
    ],
    responses: {
      '200': {
        summary: 'Check if the provider is healthy',
        content: {
          'application/json': {
            schema: {
              type: 'string'
            }
          }
        }
      }
    }
  })
  getHealth(): Promise<Health> {
    return this._healthservice.getHealth();
  }
}
