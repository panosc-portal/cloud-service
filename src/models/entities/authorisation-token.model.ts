import { model, property } from '@loopback/repository';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @property({ type: InstanceMember })
  @ManyToOne(type => InstanceMember, { eager: true, nullable: false })
  @JoinColumn({ name: 'instance_member_id' })
  instanceMember: InstanceMember;

  @property({
    type: 'number',
    required: true
  })
  @Column({ name: 'created_at', type: 'bigint' })
  createdAtMs: number;

  constructor(data?: Partial<AuthorisationToken>) {
    Object.assign(this, data);
  }

  isTimeValid(tokenValidDurationS: number): boolean {
    const validTimeMs = this.createdAtMs + (1000 * tokenValidDurationS);
    const currentTimeMs = (new Date()).getTime();
    const diffMs = currentTimeMs - validTimeMs;

    return diffMs < 0;
  }
}
