import { mapProvider, mapFlavour } from '../../views/model.view'
import { printTable } from 'console-table-printer';
import { BaseCommand } from '../../utils';
import { Provider } from '../../models';
import * as inquirer from 'inquirer';

export default class ProviderFlavoursCommand extends BaseCommand {

  static description = 'List flavours of a cloud provider'

  static examples = [
    `$ cloud-service provider:flavours`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(ProviderFlavoursCommand)
    
    this.cloudServiceUrl = flags.url;

    const providers: Provider[] = await this.getProviders();

    const questions = [{
      type: 'list',
      name: 'providerId',
      message: 'Choose a provider',
      filter: Number,
      choices: providers.map(provider => {
        return {
          name: `${provider.name} (id=${provider.id}, url=${provider.url})`,
          value: provider.id
        };
      })
    }];

    try {
      const {providerId} = await inquirer.prompt<{providerId: number}>(questions);
      const provider = providers.find(aProvider => aProvider.id === providerId);

      const flavours = await this.getProviderFlavours(providerId);

      if (flavours.length > 0) {
        console.log(`Flavours of cloud provider '${provider.name}':`);
        const flavourTableData = flavours.map(flavour => mapFlavour(flavour));
  
        printTable(flavourTableData);
        
      } else {
        console.log(`Cloud provider '${provider.name}' has no flavours`);
      }
  
    } catch (error) {
      console.error(error.message);
    } 

  }
}
