import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';
import { User, Pagination } from '../../../models';

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
    expect(user.firstName).to.equal('Joe');
    expect(user.lastName).to.equal('Bloggs');
  });

  it('saves a user', async () => {
    const users = await context.userService.getAll();
    const userCount = users.length;

    const user = new User({
      id: 1000,
      firstName: 'Simon',
      lastName: 'Says',
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
    user.firstName = 'A new name';

    const persistedUser = await context.userService.save(user);
    expect(persistedUser || null).to.not.be.null();
    expect(persistedUser.id).to.equal(user.id);
    expect(persistedUser.firstName).to.equal(user.firstName);

    const usersAfterUpdate = await context.userService.getAll();
    expect(usersAfterUpdate.length).to.equal(users.length);
  });

  it('gets user with lastName like', async () => {
    const users = await context.userService.getAllLikeLastName('cla');
    expect(users.length).to.equal(2);
  });

  it('gets user with lastName like with pagination', async () => {
    const pagination = new Pagination({limit: 1, offset: 1});
    const users = await context.userService.getAllLikeLastName('cla', pagination);
    expect(users.length).to.equal(1);
  });

});
