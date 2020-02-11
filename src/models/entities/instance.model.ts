import { model, property } from '@loopback/repository';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Plan } from './plan.model';

@Entity()
@model()
export class Instance {
  @property({
    type: 'number',
    id: true,
    required: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @property({
    type: 'string'
  })
  @Column({ length: 50, nullable: true, name: 'cloud_id' })
  cloudId: string;

  @Column({ name: 'deleted', nullable: false, default: false })
  deleted: boolean;

  @property({ type: Plan })
  @ManyToOne(type => Plan, { eager: true, nullable: false })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  constructor(data?: Partial<Instance>) {
    Object.assign(this, data);
  }
}
