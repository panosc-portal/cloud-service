export class CloudInstanceUpdatorDto {
  id: number;
  name: string;
  description: string;

  constructor(data?: Partial<CloudInstanceUpdatorDto>) {
    Object.assign(this, data);
  }
}
