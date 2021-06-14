import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { InstanceCreatorDto, Flavour, Image, AccountCreatorDto, Plan } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';
const  os = require('os')

export default class InstanceAddCommand extends BaseCommand {

  static description = 'Adds an instance to the cloud provider'

  static examples = [
    `$ cloud-provider instance:add`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(InstanceAddCommand)
    
    this.cloudServiceUrl = flags.url;

    const plans: Plan[] = await this.getPlans();

    const validNumber = function (value: string) {
      const valid = !isNaN(Number(value));
      return valid || 'Please enter a number';
    }

    // Get account info for default account values
    const accountInfo = os.userInfo();

    const questions = [{
      type: 'list',
      name: 'planId',
      message: 'Choose a plan',
      validate: validNumber,
      filter: Number,
      choices: plans.map(plan => {
        return {
          name: `${plan.name} (provider=${plan.provider.name}, image=${plan.image.name}, flavour=${plan.flavour.name})`,
          value: plan.id
        };
      })
    }, {
      type: 'input',
      name: 'name',
      message: 'Enter a name for the instance',
      validate: function (value: string) {
        return (value != null && value.length >= 4) || 'The name must be 4 or more characters long'
      }
    }, {
      type: 'input',
      name: 'description',
      message: 'Enter a description for the instance (optional)'
    }, {
      type: 'input',
      name: 'username',
      message: 'Enter a username for the account',
      default: accountInfo.username,
      validate: function (value: string) {
        return (value != null) || 'The username must not be null'
      }
    }, {
      type: 'input',
      name: 'userId',
      message: 'Enter a user ID for the account',
      default: 1,
      validate: validNumber,
      filter: Number
    }, {
      type: 'input',
      name: 'uid',
      message: 'Enter a UID for the account',
      default: accountInfo.uid,
      validate: validNumber,
      filter: Number
    }, {
      type: 'input',
      name: 'gid',
      message: 'Enter a GID for the account',
      default: accountInfo.gid,
      validate: validNumber,
      filter: Number
    }, {
      type: 'input',
      name: 'homePath',
      message: 'Enter a home path for the account',
      default: accountInfo.homedir,
      validate: function (value: string) {
        return (value != null) || 'The name must not be null'
      }
    }, {
      type: 'input',
      name: 'email',
      message: 'Enter a email for the account (optional)'
    }];

    try {
      const {name, description, planId, userId, username, uid, gid, homePath, email} = await inquirer.prompt(questions);

      const instanceCreator = new InstanceCreatorDto({
        name: name,
        description: description,
        planId: planId,
        account: new AccountCreatorDto({
          userId: userId,
          username: username,
          uid: uid,
          gid: gid,
          homePath: homePath,
          email: email
        })
      });

      console.log(JSON.stringify(instanceCreator));

      console.log('Creating instance...');
      const instance = await this.createInstance(instanceCreator);
      console.log('... done');
      printTable([mapInstance(instance)]);
  
    } catch (error) {
      console.error(error.message);
    } 
  }
}
