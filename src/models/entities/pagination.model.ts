import { model, property } from '@loopback/repository';

@model()
export class Pagination {
  @property({
    type: 'number',
  })
  limit: number;

  @property({
    type: 'number'
  })
  offset: number;

  constructor(data?: Partial<Pagination>) {
    Object.assign(this, data);
  }
}
