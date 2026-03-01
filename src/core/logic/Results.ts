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
    if (this.isFailure) {
      throw new Error('No se puede obtener el valor de un resultado fallido.');
    }
    return this._value as T;
  }

  public static ok<U>(value: U): Result<U, never> {
    return new Result<U, never>(true, null, value);
  }

  public static fail<E extends DomainError>(error: E): Result<never, E> {
    return new Result<never, E>(false, error, null);
  }
}
