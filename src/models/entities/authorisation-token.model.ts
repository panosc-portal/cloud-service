import { model, property } from '@loopback/repository';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { Provider } from './provider.model';
import { InstanceMember } from './instance-member.model';

@Entity()
@model()
export class AuthorisationToken {
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
  @Column({ length: 250, unique: true })
  token: string;

  @property({
    type: 'string'
  })
  @Column({ length: 100, nullable: true })
  username: string;

  @property({ type: Provider })
  @ManyToOne(type => Provider, { eager: true, nullable: false })
  @JoinColumn({ name: 'instance_member_id' })
  instanceMember: InstanceMember;

  @property({
    type: 'date',
    required: true
  })
  @CreateDateColumn({ name: 'created_at', type: process.env.NODE_ENV === 'test' ? 'date' : 'timestamp' })
  createdAt: Date;

  constructor(data?: Partial<AuthorisationToken>) {
    Object.assign(this, data);
  }
}
