import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { BaseCommand } from '../../utils';

export default class InstanceListCommand extends BaseCommand {

  static description = 'List instances of the cloud service'

  static examples = [
    `$ cloud-service instance:list`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(InstanceListCommand)
    
    this.cloudServiceUrl = flags.url;

    const instances = await this.getInstances();

    if (instances.length > 0) {
      const instanceTableData = instances.map(instance => mapInstance(instance));

      printTable(instanceTableData);
      
    } else {
      console.log('The cloud service contains no instances');
    }
  }
}
