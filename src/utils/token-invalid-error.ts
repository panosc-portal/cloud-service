import { LoggedError } from './logged-error';

export class TokenInvalidError extends LoggedError {

  isTokenInvalidError = true;

  constructor(message: string) {
    super(message);
  }
}
