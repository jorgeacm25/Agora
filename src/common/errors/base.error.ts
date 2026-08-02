import { IError } from "../interface/error.interface";

export class BaseError implements IError {
  constructor(public readonly message: string, public readonly code: number) {}
}