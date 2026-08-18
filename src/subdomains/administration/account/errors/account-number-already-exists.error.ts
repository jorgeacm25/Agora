import { BaseError } from '../../../../common/errors/base.error';

export class AccountNumberAlreadyExistsError extends BaseError {
  constructor(accountNumber: string) {
    super(`El número de cuenta '${accountNumber}' ya está en uso`, 409);
  }
}