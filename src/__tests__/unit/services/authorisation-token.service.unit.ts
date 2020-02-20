import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';

describe('AuthorisationTokenService', () => {
  let context: TestApplicationContext;

  before('get context', async () => {
    context = createTestApplicationContext();
  });

  after('close db connect', closeTestDatabase);

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all authorisationTokens', async () => {
    const authorisationTokens = await context.authorisationTokenService.getAll();
    expect(authorisationTokens.length).to.equal(2);
  });

  it('gets a authorisationToken by Id', async () => {
    const authorisationToken = await context.authorisationTokenService.getById(1);

    expect(authorisationToken || null).to.not.be.null();
    expect(authorisationToken.token).to.equal('24e7437a-eae5-48c4-923e-778c42a6acf8');
  });

  it('gets a authorisationToken by token', async () => {
    const authorisationToken = await context.authorisationTokenService.getByToken('24e7437a-eae5-48c4-923e-778c42a6acf8');

    expect(authorisationToken || null).to.not.be.null();
    expect(authorisationToken.id).to.equal(1);
    expect(authorisationToken.username).to.equal('bloggs');
  });

  it('creates an authorisationTokens', async () => {
    const authorisationTokens = await context.authorisationTokenService.getAll();
    const initialCount = authorisationTokens.length;

    const instanceMember = await context.instanceMemberService.getById(3);
    const authorisationToken = await context.authorisationTokenService.create('tote', instanceMember);

    expect(authorisationToken || null).to.not.be.null();
    expect(authorisationToken.id || null).to.not.be.null();
    expect(authorisationToken.createdAt || null).to.not.be.null();

    const authorisationTokens2 = await context.authorisationTokenService.getAll();
    expect(authorisationTokens2.length).to.equal(initialCount + 1);
  });
});
