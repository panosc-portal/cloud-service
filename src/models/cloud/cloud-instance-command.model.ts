import { model, property } from '@loopback/repository';
import { CloudInstanceCommandType } from './cloud-instance-command-type.enum';

@model()
export class CloudInstanceCommand {
  @property({
    type: 'string'
  })
  type: CloudInstanceCommandType;

  constructor(data?: Partial<CloudInstanceCommand>) {
    Object.assign(this, data);
  }
}
