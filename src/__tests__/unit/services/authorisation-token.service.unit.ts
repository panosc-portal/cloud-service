import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase, closeTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext, TestApplicationContext } from '../../helpers/context.helper';
import { APPLICATION_CONFIG } from '../../../application-config';

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
    expect(authorisationToken.instanceMember || null).to.not.be.null();
    expect(authorisationToken.instanceMember.user.id).to.equal(1);
  });

  it('creates an authorisationToken', async () => {
    const authorisationTokens = await context.authorisationTokenService.getAll();
    const initialCount = authorisationTokens.length;

    const instanceMember = await context.instanceMemberService.getById(3);
    const authorisationToken = await context.authorisationTokenService.create(instanceMember);

    expect(authorisationToken || null).to.not.be.null();
    expect(authorisationToken.id || null).to.not.be.null();
    expect(authorisationToken.createdAtMs || null).to.not.be.null();

    const authorisationTokens2 = await context.authorisationTokenService.getAll();
    expect(authorisationTokens2.length).to.equal(initialCount + 1);
  });

  it('validates a good authorisationToken', async () => {
    const instanceMember = await context.instanceMemberService.getById(3);
    const authorisationToken = await context.authorisationTokenService.create(instanceMember);

    expect(authorisationToken || null).to.not.be.null();
    expect(authorisationToken.id || null).to.not.be.null();
    expect(authorisationToken.createdAtMs || null).to.not.be.null();

    const instanceAuthorisation = await context.authorisationTokenService.validate(1, authorisationToken.token);
    expect(instanceAuthorisation || null).to.not.be.null();
    expect(instanceAuthorisation.instanceMember || null).to.not.be.null();
  });

  it('invalidates a bad authorisationToken by time', async () => {
    const instanceMember = await context.instanceMemberService.getById(3);
    const authorisationToken = await context.authorisationTokenService.create(instanceMember);

    expect(authorisationToken || null).to.not.be.null();
    expect(authorisationToken.id || null).to.not.be.null();
    expect(authorisationToken.createdAtMs || null).to.not.be.null();

    const originalDelayS = APPLICATION_CONFIG().authorisation.tokenValidDurationS;
    APPLICATION_CONFIG().authorisation.tokenValidDurationS = 1;
    const delay = (delayS: number) => new Promise((resolve) => setTimeout(resolve, delayS * 1000));
    await delay(APPLICATION_CONFIG().authorisation.tokenValidDurationS);

    let error = null;
    try {
      await context.authorisationTokenService.validate(1, authorisationToken.token);
    } catch (err) {
      error = err;
    }
    expect(error || null).to.not.be.null();
    expect(error.isTokenInvalidError || null).to.not.be.null();
    expect(error.isTokenInvalidError).to.be.true();

    APPLICATION_CONFIG().authorisation.tokenValidDurationS = originalDelayS;
  });
});
