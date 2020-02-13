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
    type: 'number'
  })
  @Column({ nullable: false, name: 'cloud_id' })
  cloudId: number;

  @property({ type: Plan })
  @ManyToOne(type => Plan, { eager: true, nullable: false })
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @Column({ name: 'deleted', nullable: false, default: false })
  deleted: boolean;

  constructor(data?: Partial<Instance>) {
    Object.assign(this, data);
  }
}
