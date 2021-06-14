
export class PlanCreatorDto {
  name: string;
  description?: string;
  providerId: number;
  imageId: number;
  flavourId: number;

  constructor(data?: Partial<PlanCreatorDto>) {
    Object.assign(this, data);
  }
}
