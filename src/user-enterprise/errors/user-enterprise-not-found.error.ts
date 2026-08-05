import { BaseError } from '../../common/errors/base.error';

export class UserEnterpriseNotFoundError extends BaseError {
  constructor() {
    super(`Empresa de usuario no encontrada`, 404);
  }
}