import { Provider } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class ProviderDeleteCommand extends BaseCommand {

  static description = 'Deletes a provider from the cloud service'

  static examples = [
    `$ cloud-service provider:delete`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(ProviderDeleteCommand)
    
    this.cloudServiceUrl = flags.url;

    const providers: Provider[] = await this.getProviders();

    const questions = [{
      type: 'list',
      name: 'providerId',
      message: 'Choose a provider to delete',
      filter: Number,
      choices: providers.map(provider => {
        return {
          name: `${provider.name} (id=${provider.id}, url=${provider.url})`,
          value: provider.id
        };
      })
    }];

    try {
      const answers = await inquirer.prompt<{providerId: number}>(questions);

      console.log(`Deleting provider ${answers.providerId}...`);
      const done: boolean = await this.deleteProvider(answers.providerId);
      if (done) {
        console.log('... done');

      } else {
        console.error('... failed');
      }
  
    } catch (error) {
      console.error(error.message);
    } 
  }
}
