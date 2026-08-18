import { BaseError } from '../../common/errors/base.error';

export class UserNotFoundForRatingError extends BaseError {
  constructor(userId: string) {
    super(`Usuario con ID ${userId} no encontrado`, 404);
  }
}