import { model, property } from '@loopback/repository';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@model()
export class Provider {
  @property({
    type: 'number',
    id: true,
    required: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @property({
    type: 'string',
    required: true
  })
  @Index('provider_name_index')
  @Column({ length: 250 })
  name: string;

  @property({
    type: 'string'
  })
  @Column({ length: 2500, nullable: true })
  description?: string;

  @property({
    type: 'number',
    required: true
  })
  @Column({ length: 250 })
  url: string;

  constructor(data?: Partial<Provider>) {
    Object.assign(this, data);
  }
}
