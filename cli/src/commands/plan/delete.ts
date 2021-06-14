import { Plan } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class PlanDeleteCommand extends BaseCommand {

  static description = 'Deletes a plan from the cloud service'

  static examples = [
    `$ cloud-service plan:delete`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(PlanDeleteCommand)
    
    this.cloudServiceUrl = flags.url;

    const plans: Plan[] = await this.getPlans();

    const questions = [{
      type: 'list',
      name: 'planId',
      message: 'Choose a plan to delete',
      filter: Number,
      choices: plans.map(plan => {
        return {
          name: `${plan.name} (provider=${plan.provider.name}, image=${plan.image.name}, flavour=${plan.flavour.name})`,
          value: plan.id
        };
      })
    }];

    try {
      const answers = await inquirer.prompt<{planId: number}>(questions);

      console.log(`Deleting plan ${answers.planId}...`);
      const done: boolean = await this.deletePlan(answers.planId);
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
