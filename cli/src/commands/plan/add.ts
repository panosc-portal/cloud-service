import { mapPlan } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { PlanCreatorDto, Provider } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class PlanAddCommand extends BaseCommand {

  static description = 'Adds a plan to the cloud service'

  static examples = [
    `$ cloud-service plan:add`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(PlanAddCommand)
    
    this.cloudServiceUrl = flags.url;
    
    const validNumber = function (value: string) {
      const valid = !isNaN(Number(value));
      return valid || 'Please enter a number';
    }

    try {
     
      const providers: Provider[] = await this.getProviders();


      const {providerId} = await inquirer.prompt<{providerId: number}>([{
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
      }]);

      // Get images and flavours of the provider
      const images = await this.getProviderImages(providerId);
      const flavours = await this.getProviderFlavours(providerId);
  
      const { name, description, imageId, flavourId } = await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Enter a name for the plan',
        validate: function(value: string) {
          return (value != null && value.length >= 4) || 'The name must be 4 or more characters long'
        }
      }, {
        type: 'list',
        name: 'imageId',
        message: 'Choose an image',
        validate: validNumber,
        filter: Number,
        choices: images.map(image => {
          return {
            name: `${image.name} ${image.description != null ? '(' + image.description + ')' : ''}`,
            value: image.id
          };
        })
      }, {
        type: 'list',
        name: 'flavourId',
        message: 'Choose a flavour',
        validate: validNumber,
        filter: Number,
        choices: flavours.map(flavour => {
          return {
            name: `${flavour.name} (${flavour.cpu} Cores, ${flavour.memory}MB RAM)`,
            value: flavour.id
          };
        })
      }, {
        type: 'input',
        name: 'description',
        message: 'Enter a description for the provider (optional)'
      }]);

      const planCreator = new PlanCreatorDto({
        name: name,
        description: description,
        providerId: providerId,
        imageId: imageId,
        flavourId: flavourId
      });
      
      
      console.log(JSON.stringify(planCreator));

      console.log('Creating plan...');
      const plan = await this.createPlan(planCreator);
      console.log('... done');
      printTable([mapPlan(plan)]);

    } catch (error) {
      console.error(error.message);
    } 
  }
}
