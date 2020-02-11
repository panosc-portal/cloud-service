import { model, property } from '@loopback/repository';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Provider } from './provider.model';

@Entity()
@model()
export class Plan {
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
  @Index('plan_name_index')
  @Column({ length: 250 })
  name: string;

  @property({
    type: 'string'
  })
  @Column({ length: 2500, nullable: true })
  description?: string;

  @property({ type: Provider })
  @ManyToOne(type => Provider, { eager: true, nullable: false })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @property({
    type: 'number'
  })
  @Column({ nullable: false, name: 'cloud_image_id' })
  imageId: number;

  @property({
    type: 'number'
  })
  @Column({ nullable: false, name: 'cloud_flavour_id' })
  flavourId: number;

  constructor(data?: Partial<Plan>) {
    Object.assign(this, data);
  }
}
