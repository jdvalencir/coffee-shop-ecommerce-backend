import { DomainError } from '../errors/DomainError';

export class Result<T, E extends DomainError = DomainError> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: E | null;
  private readonly _value: T | null;

  private constructor(isSuccess: boolean, error: E | null, value: T | null) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
  }

  public getValue(): T {
    if (!this.isSuccess || this._value === null) {
      throw new Error('No se puede obtener el valor de un resultado fallido.');
    }
    return this._value;
  }

  public static ok<U>(value: U): Result<U, never> {
    return new Result<U, never>(true, null, value);
  }

  public static fail<U, E extends DomainError>(error: E): Result<U, E> {
    return new Result<U, E>(false, error, null);
  }
}
