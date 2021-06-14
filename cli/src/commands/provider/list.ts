import { mapProvider } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { BaseCommand } from '../../utils';

export default class ProviderListCommand extends BaseCommand {

  static description = 'List providers of the cloud service'

  static examples = [
    `$ cloud-service provider:list`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(ProviderListCommand)
    
    this.cloudServiceUrl = flags.url;

    const providers = await this.getProviders();

    if (providers.length > 0) {
      const providerTableData = providers.map(provider => mapProvider(provider));

      printTable(providerTableData);
      
    } else {
      console.log('The cloud service contains no providers');
    }
  }
}
