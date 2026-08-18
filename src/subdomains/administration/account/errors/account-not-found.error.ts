import { BaseError } from '../../../../common/errors/base.error';

export class AccountNotFoundError extends BaseError {
  constructor() {
    super('Cuenta no encontrada', 404);
  }
}