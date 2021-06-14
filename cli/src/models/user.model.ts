export class User {
  id: number;
  email: string;

  constructor(data?: Partial<User>) {
    Object.assign(this, data);
  }
}
