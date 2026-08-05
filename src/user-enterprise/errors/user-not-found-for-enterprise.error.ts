import { BaseError } from '../../common/errors/base.error';

export class UserNotFoundForEnterpriseError extends BaseError {
  constructor(userId: string) {
    super(`Usuario con ID '${userId}' no encontrado para crear la empresa`, 404);
  }
}