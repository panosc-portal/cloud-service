import {Command, flags} from '@oclif/command'
import Axios, { AxiosInstance } from 'axios';
import { Provider } from '../models/provider.model';
import { ProviderCreatorDto, Image, Flavour, Plan, PlanCreatorDto, Instance, InstanceCreatorDto, InstanceActionDto, AuthorisationToken } from '../models';

export abstract class BaseCommand extends Command {

  static baseFlags = {
    help: flags.help({char: 'h'}),
    url: flags.string({char: 'u', description: 'URL of the cloud service', default: 'http://localhost:3001'}),
  }

  private _apiClient: AxiosInstance;
  private _cloudServiceUrl: string;

  protected set cloudServiceUrl(value: string) {
    this._cloudServiceUrl = value;
  }

  protected get apiClient(): AxiosInstance {
    if (this._apiClient == null) {
      this._apiClient = Axios.create({
        baseURL: `${this._cloudServiceUrl}/api`,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return this._apiClient;
  }

  async getProviders(): Promise<Provider[]> {
    const response = await this.apiClient.get('providers');
    return response.data;
  }

  async createProvider(provider: ProviderCreatorDto): Promise<Provider> {
    const response = await this.apiClient.post('providers', provider);
    return response.data;
  }

  async deleteProvider(providerId: number): Promise<boolean> {
    const response = await this.apiClient.delete(`providers/${providerId}`);
    return response.data;
  }

  async getProviderImages(providerId: number): Promise<Image[]> {
    const response = await this.apiClient.get(`providers/${providerId}/images`);
    return response.data;
  }

  async getProviderFlavours(providerId: number): Promise<Flavour[]> {
    const response = await this.apiClient.get(`providers/${providerId}/flavours`);
    return response.data;
  }

  async getPlans(): Promise<Plan[]> {
    const response = await this.apiClient.get('plans');
    return response.data;
  }

  async createPlan(plan: PlanCreatorDto): Promise<Plan> {
    const response = await this.apiClient.post('plans', plan);
    return response.data;
  }

  async deletePlan(planId: number): Promise<boolean> {
    const response = await this.apiClient.delete(`plans/${planId}`);
    return response.data;
  }

  async getInstances(): Promise<Instance[]> {
    const response = await this.apiClient.get('instances');
    return response.data;
  }

  async createInstance(instance: InstanceCreatorDto): Promise<Instance> {
    const response = await this.apiClient.post('instances', instance);
    return response.data;
  }

  async deleteInstance(instanceId: number): Promise<boolean> {
    const response = await this.apiClient.delete(`instances/${instanceId}`);
    return response.data;
  }

  async startInstance(instanceId: number): Promise<Instance> {
    const instanceAction: InstanceActionDto = new InstanceActionDto({type: 'START'});
    const response = await this.apiClient.post(`instances/${instanceId}/actions`, instanceAction);
    return response.data;
  }

  async stopInstance(instanceId: number): Promise<Instance> {
    const instanceAction: InstanceActionDto = new InstanceActionDto({type: 'SHUTDOWN'});
    const response = await this.apiClient.post(`instances/${instanceId}/actions`, instanceAction);
    return response.data;
  }

  async rebootInstance(instanceId: number): Promise<Instance> {
    const instanceAction: InstanceActionDto = new InstanceActionDto({type: 'REBOOT'});
    const response = await this.apiClient.post(`instances/${instanceId}/actions`, instanceAction);
    return response.data;
  }

  async getInstanceAuthorisationToken(instanceId: number): Promise<AuthorisationToken> {
    const response = await this.apiClient.post(`instances/${instanceId}/token`);
    return response.data;
  }

}
