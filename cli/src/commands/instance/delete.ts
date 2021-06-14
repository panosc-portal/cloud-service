import { Instance } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class InstanceDeleteCommand extends BaseCommand {

  static description = 'Deletes a instance from the cloud service'

  static examples = [
    `$ cloud-service instance:delete`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(InstanceDeleteCommand)
    
    this.cloudServiceUrl = flags.url;
    try {

      const instances: Instance[] = await this.getInstances();

      if (instances.length > 0) {
        const questions = [{
          type: 'list',
          name: 'instanceId',
          message: 'Choose a instance to delete',
          filter: Number,
          choices: instances.map(instance => {
            return {
              name: `${instance.name} (id=${instance.id}, plan=${instance.plan.name}, status=${instance.state.status})`,
              value: instance.id
            };
          })
        }];
        const answers = await inquirer.prompt<{instanceId: number}>(questions);

        console.log(`Deleting instance ${answers.instanceId}...`);
        const done: boolean = await this.deleteInstance(answers.instanceId);
        if (done) {
          console.log('... done');

        } else {
          console.error('... failed');
        }
    
      } else {
        console.log('The cloud service has no instances');
      }
      
    } catch (error) {
      console.error(error.message);
    } 
  }
}
