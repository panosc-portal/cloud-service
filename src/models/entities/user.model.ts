import { model, property } from '@loopback/repository';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
@model()
export class User {
  @property({
    type: 'number',
    id: true,
    required: true
  })
  @PrimaryColumn()
  id: number;

  @property({
    type: 'string',
  })
  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string;

  @property({
    type: 'string',
  })
  @Column({ name: 'last_name', length: 100, nullable: false })
  lastName: string;

  @property({
    type: 'string',
  })
  @Column({ length: 100, nullable: true })
  email: string;

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}
