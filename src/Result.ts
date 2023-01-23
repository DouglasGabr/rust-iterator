import { Iter } from './Iterator';
import { None, Option, Some } from './Option';

enum ResultType {
  Ok = 'Ok',
  Err = 'Err',
}

export class Result<T, E> {
  private __type: ResultType;
  private __value: T | E;

  private constructor(type: ResultType, value: T | E) {
    this.__type = type;
    this.__value = value;
  }

  static Ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(ResultType.Ok, value);
  }

  static Err<E>(err: E): Result<never, E> {
    return new Result<never, E>(ResultType.Err, err);
  }

  match<A, B>(ok: (value: T) => A, err: (err: E) => B): A | B {
    switch (this.__type) {
      case ResultType.Ok:
        return ok(this.__value as T);
      case ResultType.Err:
        return err(this.__value as E);
    }
  }
  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return this.match(fn, Err);
  }
  and<U>(result: Result<U, E>): Result<U, E> {
    return this.andThen(() => result);
  }
  err(): Option<E> {
    return this.match(None, Some);
  }
  expect(message: string): T {
    return this.match(
      (v) => v,
      () => {
        throw new Error(message);
      },
    );
  }
  expectErr(message: string): E {
    return this.match(
      () => {
        throw new Error(message);
      },
      (e) => e,
    );
  }
  isErr(): boolean {
    return this.__type === ResultType.Err;
  }
  isOk(): boolean {
    return this.__type === ResultType.Ok;
  }
  iter(): Iter<T> {
    return this.match(
      (v) => Iter.from([v]),
      () => Iter.from<T>([]),
    );
  }
  map<U>(fn: (value: T) => U): Result<U, E> {
    return this.andThen((v) => Ok(fn(v)));
  }
  mapErr<F>(fn: (err: E) => F): Result<T, F> {
    return this.match(Ok, (e) => Err(fn(e)));
  }
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U {
    return this.mapOrElse(() => defaultValue, fn);
  }
  mapOrElse<U>(defaultValue: (err: E) => U, fn: (value: T) => U): U {
    return this.match(fn, defaultValue);
  }
  ok(): Option<T> {
    return this.match(Some, None);
  }
  or<F>(result: Result<T, F>): Result<T, F> {
    return this.orElse(() => result);
  }
  orElse<F>(fn: (err: E) => Result<T, F>): Result<T, F> {
    return this.match(Ok, fn);
  }
  transpose<U>(this: Result<Option<U>, E>): Option<Result<U, E>> {
    return this.match(
      (v) =>
        v.match(
          (v) => Some(Ok(v)),
          () => None(),
        ),
      (e) => Some(Err(e)),
    );
  }
  unwrap(): T {
    return this.expect('called `Result.unwrap()` on an `Err` value');
  }
  unwrapErr(): E {
    return this.expectErr('called `Result.unwrapErr()` on an `Ok` value');
  }
  unwrapOrElse(fn: (err: E) => T): T {
    return this.match((v) => v, fn);
  }
  unwrapOr(defaultValue: T): T {
    return this.unwrapOrElse(() => defaultValue);
  }
}

export const Ok = Result.Ok.bind(Result);
export const Err = Result.Err.bind(Result);
