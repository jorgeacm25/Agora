import { BaseError } from '../../common/errors/base.error';

export class ServiceAlreadyExistsError extends BaseError {
  constructor(name: string) {
    super(`El servicio '${name}' ya existe en esta empresa`, 409);
  }
}