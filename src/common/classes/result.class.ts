// src/common/classes/result.class.ts
import { BaseError } from '../errors/base.error';

export class Result<T> {
  public readonly data: T | null;
  public readonly error: BaseError | null; // Cambiamos IError por BaseError
  public readonly isSuccess: boolean;

  private constructor(data: T | null, error: BaseError | null) {
    this.data = data;
    this.error = error;
    this.isSuccess = error === null;
  }

  static success<T>(data: T): Result<T> {
    return new Result<T>(data, null);
  }

  static successNoData(): Result<void> {
    return new Result<void>(null, null);
  }

  static error<T>(error: BaseError): Result<T> { // Ahora recibe BaseError
    return new Result<T>(null, error);
  }

  // Método para obtener el código de estado
  getStatusCode(): number {
    return this.error ? this.error.code : 200;
  }

  // Método para obtener el mensaje de error (si existe)
  getErrorMessage(): string | null {
    return this.error ? this.error.message : null;
  }
}