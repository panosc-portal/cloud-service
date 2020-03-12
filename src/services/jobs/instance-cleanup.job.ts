import { Job } from "./job";
import { job, jobInject } from "./job-provider";
import { InstanceService } from "../instance.service";
import { logger } from "../../utils";
import { CloudInstanceService } from "../cloud";

@job()
export class InstanceCleanupJob extends Job {

  @jobInject('services.InstanceService')
  private _instanceService: InstanceService;

  @jobInject('services.CloudInstanceService')
  private _cloudInstanceService: CloudInstanceService;

  protected async _execute(params?: any): Promise<any> {
    try {
      // Get all instances
      const instances = await this._instanceService.getAll();

      // Get all unique plans for the instances
      const plans = instances.map(instance => instance.plan).filter((plan, pos, array) => array.map(mapPlan => mapPlan.id).indexOf(plan.id) === pos);

      // Get all providers from the plans
      const providers = plans.map(plan => plan.provider).filter((provider, pos, array) => array.map(mapProvider => mapProvider.id).indexOf(provider.id) === pos);

      // Convert plans to DTOs and get cloud instances from all providers
      const allProviderInstances = await Promise.all(providers.map(async provider => {
        const cloudInstances = await this._cloudInstanceService.getAll(provider);
        return {
          provider: provider,
          instanceIds: cloudInstances.map(cloudInstance => cloudInstance.id)
        };
      }));

      // Convert to map
      const providerInstances = allProviderInstances.reduce((map, obj) => map.set(obj.provider.id, obj.instanceIds), new Map<number, number[]>());


      // filter instances that no longer have cloud equivalents
      const defunctInstances = instances.filter(instance => {
        const cloudInstances = providerInstances.get(instance.plan.provider.id);
        return !cloudInstances.includes(instance.cloudId);
      });

      // Cleanup defunct instances
      for (let i = 0; i < defunctInstances.length; i++) {
        const defunctInstance = defunctInstances[i];
        await this._instanceService.delete(defunctInstance);
      }

      if (defunctInstances.length > 0) {
        logger.info(`Instance Cleanup: deleted ${defunctInstances.length} instances`);
      }

    } catch (error) {
      throw error;
    }
  }
}
