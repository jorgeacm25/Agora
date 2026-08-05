import { BaseError } from '../../common/errors/base.error';

export class UserEnterpriseAlreadyExistsError extends BaseError {
  constructor(userId: string) {
    super(`El usuario con ID '${userId}' ya tiene una empresa registrada`, 409);
  }
}