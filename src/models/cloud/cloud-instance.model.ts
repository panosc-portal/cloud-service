import { model, property } from '@loopback/repository';
import { CloudInstanceState } from './cloud-instance-state.model';
import { CloudProtocol } from './cloud-protocol.model';

@model()
export class CloudInstance {

  @property({
    type: 'number',
    id: true
  })
  id: number;

  @property({
    type: 'string'
  })
  name: string;

  @property({
    type: 'string'
  })
  description?: string;

  @property({
    type: 'string',
  })
  hostname: string;

  @property({
    type: 'string'
  })
  computeId: string;

  @property({
    type: 'string'
  })
  status: string;

  @property({
    type: 'string'
  })
  statusMessage: string;

  @property({
    type: 'number'
  })
  currentCPU: number;

  @property({
    type: 'number'
  })
  currentMemory: number;

  @property({
    type: 'date'
  })
  createdAt: Date;

  @property({
    type: 'date'
  })
  updatedAt: Date;

  @property({
    type: 'array',
    itemType: 'object'
  })
  protocols: CloudProtocol[];

  get state(): CloudInstanceState {
    return new CloudInstanceState({
      status: this.status,
      cpu: this.currentCPU,
      memory: this.currentMemory
    });
  }

  set state(value: CloudInstanceState) {
    this.status = value.status;
    this.statusMessage = value.message;
    this.currentCPU = value.cpu;
    this.currentMemory = value.memory;
  }

  constructor(data?: Partial<CloudInstance>) {
    Object.assign(this, data);
  }
}
