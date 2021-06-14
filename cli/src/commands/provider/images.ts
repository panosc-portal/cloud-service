import { mapProvider, mapImage } from '../../views/model.view'
import { printTable } from 'console-table-printer';
import { BaseCommand } from '../../utils';
import { Provider } from '../../models';
import * as inquirer from 'inquirer';

export default class ProviderImagesCommand extends BaseCommand {

  static description = 'List images of a cloud provider'

  static examples = [
    `$ cloud-service provider:images`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(ProviderImagesCommand)
    
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

      const images = await this.getProviderImages(providerId);

      if (images.length > 0) {
        console.log(`Images of cloud provider '${provider.name}':`);
        const imageTableData = images.map(image => mapImage(image));
  
        printTable(imageTableData);
        
      } else {
        console.log(`Cloud provider '${provider.name}' has no images`);
      }
  
    } catch (error) {
      console.error(error.message);
    } 

  }
}
