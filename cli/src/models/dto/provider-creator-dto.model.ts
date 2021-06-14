
export class ProviderCreatorDto {
  name: string;
  description?: string;
  url: string;

  constructor(data?: Partial<ProviderCreatorDto>) {
    Object.assign(this, data);
  }
}
