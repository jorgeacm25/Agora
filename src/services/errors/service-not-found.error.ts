import { BaseError } from '../../common/errors/base.error';

export class ServiceNotFoundError extends BaseError {
  constructor(id: string) {
    super(`El servicio con ID '${id}' no fue encontrado`, 404);
  }
}