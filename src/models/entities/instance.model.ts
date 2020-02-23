import { model, property } from '@loopback/repository';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Plan } from './plan.model';
import { InstanceMember } from './instance-member.model';
import { InstanceMemberRole } from './instance-member-role.enum';
import { User } from './user.model';

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

  @property({
    type: 'array',
    itemType: 'object'
  })
  @OneToMany(type => InstanceMember, instanceMember => instanceMember.instance, {
    eager: true,
    cascade: true
  })
  members: InstanceMember[];

  @property({
    type: 'date',
    required: true
  })
  @CreateDateColumn({ name: 'created_at', type: process.env.NODE_ENV === 'test' ? 'date' : 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: process.env.NODE_ENV === 'test' ? 'date' : 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'deleted', nullable: false, default: false })
  deleted: boolean;

  constructor(data?: Partial<Instance>) {
    Object.assign(this, data);
  }

  addMember(user: User, role: InstanceMemberRole): InstanceMember {
    if (this.members == null) {
      this.members = [];
    }

    const existingMember = this.members.find(member => member.user.id === user.id && member.role === role);
    if (existingMember == null) {
      const member = new InstanceMember({
        user: user,
        role: role
      });
      this.members.push(member);
      return member;

    } else {
      return existingMember;
    }
  }
}
