import { BaseError } from '../../common/errors/base.error';

export class InvalidCurrentPasswordError extends BaseError {
  constructor() {
    super('Contraseña actual incorrecta', 401);
  }
}