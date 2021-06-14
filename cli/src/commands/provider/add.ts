import { mapProvider } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { ProviderCreatorDto } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class ProviderAddCommand extends BaseCommand {

  static description = 'Adds a provider to the cloud service'

  static examples = [
    `$ cloud-service provider:add`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(ProviderAddCommand)
    
    this.cloudServiceUrl = flags.url;
    
    const questions = [{
      type: 'input',
      name: 'name',
      message: 'Enter a name for the provider',
      validate: function(value: string) {
        return (value != null && value.length >= 4) || 'The name must be 4 or more characters long'
      }
    }, {
      type: 'input',
      name: 'url',
      message: 'Enter the URL of the provider',
      validate: function(value: string) {
        return value != null || 'The name must not be null'
      }
    }, {
      type: 'input',
      name: 'description',
      message: 'Enter a description for the provider (optional)'
    }];

    try {
      const answers = await inquirer.prompt<{name: string, url: string, description: string}>(questions);

      const providerCreator = new ProviderCreatorDto();
      providerCreator.name = answers.name;
      providerCreator.description  = answers.description === '' ? undefined : answers.description
      providerCreator.url = answers.url;

      console.log(JSON.stringify(providerCreator));

      console.log('Creating provider...');
      const provider = await this.createProvider(providerCreator);
      console.log('... done');
      printTable([mapProvider(provider)]);
  
    } catch (error) {
      console.error(error.message);
    } 
  }
}
