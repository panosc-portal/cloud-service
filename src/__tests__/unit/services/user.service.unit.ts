import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';
import { User } from '../../../models';

describe('UserService', () => {
  let context: TestApplicationContext;

  before('get context', async () => {
    context = createTestApplicationContext();
  });

  after('close db connect', closeTestDatabase);

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all users', async () => {
    const users = await context.userService.getAll();
    expect(users.length).to.equal(6);
  });

  it('gets a user', async () => {
    const user = await context.userService.getById(1);

    expect(user || null).to.not.be.null();
    expect(user.email).to.equal('bloggs@example.com');
  });

  it('saves a user', async () => {
    const users = await context.userService.getAll();
    const userCount = users.length;

    const user = new User({
      id: 1000,
      email: 'simon@says.me',
    });
    await context.userService.save(user);
    expect(user.id || null).to.not.be.null();

    const persistedUser = await context.userService.getById(user.id);
    expect(persistedUser || null).to.not.be.null();

    const users2 = await context.userService.getAll();
    expect(users2.length).to.equal(userCount + 1);
  });

  it('deletes a user', async () => {
    let users = await context.userService.getAll();
    const userCount = users.length;

    const user = users.find(aUser => aUser.id === 6);

    await context.userService.delete(user);

    users = await context.userService.getAll();
    expect(users.length).to.equal(userCount - 1);
  });

  it('updates a user', async () => {
    const users = await context.userService.getAll();

    const user = users[0];
    user.email = 'someone@here.io';

    const persistedUser = await context.userService.save(user);
    expect(persistedUser || null).to.not.be.null();
    expect(persistedUser.id).to.equal(user.id);
    expect(persistedUser.email).to.equal(user.email);

    const usersAfterUpdate = await context.userService.getAll();
    expect(usersAfterUpdate.length).to.equal(users.length);
  });
});
