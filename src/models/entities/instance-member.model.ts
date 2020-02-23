import { model, property } from '@loopback/repository';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, Index, Column } from 'typeorm';
import { User } from './user.model';
import { Instance } from './instance.model';
import { InstanceMemberRole } from './instance-member-role.enum';

@Entity()
@model()
export class InstanceMember {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @property({
    type: User,
    required: true
  })
  @ManyToOne(type => User, { eager: true, nullable: false, cascade: true, })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @property({
    type: 'number',
    required: false
  })
  @Column({ name: 'instance_id', nullable: true })
  instanceId: number;

  @ManyToOne(type => Instance, instance => instance.members, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'instance_id', referencedColumnName: 'id' })
  instance: Instance;

  @property({
    type: 'string'
  })
  @Index('instance_member_role_index')
  @Column({ length: 50 })
  role: InstanceMemberRole;

  @property({
    type: 'date',
    required: true
  })
  @CreateDateColumn({ name: 'created_at', type: process.env.NODE_ENV === 'test' ? 'date' : 'timestamp' })
  createdAt: Date;

  constructor(data?: Partial<InstanceMember>) {
    Object.assign(this, data);
  }
}
