import { iter } from './Iterator';

type FlatOption<T> = T extends Option<unknown> ? T : Option<T>;

export abstract class Option<T> {
  abstract match<A, B>(ifSome: (value: T) => A, ifNone: () => B): A | B;
  unwrap(): T {
    return this.expect('called Option.unwrap() on a None value');
  }
  expect(message: string): T {
    return this.match(
      (value) => value,
      () => {
        throw new Error(message);
      },
    );
  }
  filter(predicate: (value: T) => boolean): Option<T> {
    return this.match(
      (value) => (predicate(value) ? this : new None<T>()),
      () => new None<T>(),
    );
  }
  flatten(this: Option<Option<unknown>>): FlatOption<T> {
    return this.match(
      (value) => value as FlatOption<T>,
      () => new None<T>() as FlatOption<T>,
    );
  }
  map<U>(fn: (value: T) => U): Option<U> {
    return this.match(
      (value) => new Some(fn(value)),
      () => new None<U>(),
    );
  }

  iter() {
    return iter([this]);
  }

  and<U>(other: Option<U>): Option<U> {
    return this.match(
      () => other,
      () => new None<U>(),
    );
  }
  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return this.match(fn, () => new None<U>());
  }
  or(other: Option<T>): Option<T> {
    return this.match(
      () => this,
      () => other,
    );
  }
  orElse(fn: () => Option<T>): Option<T> {
    return this.match(() => this, fn);
  }
  isNone(): this is None<T> {
    return this instanceof None;
  }
  isSome(): this is Some<T> {
    return this instanceof Some;
  }
  zip<U>(other: Option<U>): Option<[T, U]> {
    return this.match(
      (value) => other.map((otherValue) => [value, otherValue]),
      () => new None<[T, U]>(),
    );
  }
  unzip<U, V>(this: Option<[U, V]>): [Option<U>, Option<V>] {
    return this.match(
      ([u, v]) => [new Some(u), new Some(v)],
      () => [new None<U>(), new None<V>()],
    );
  }
  xor(other: Option<T>): Option<T> {
    return this.match(
      () =>
        other.match(
          () => new None<T>(),
          () => this,
        ),
      () =>
        other.match(
          () => other,
          () => new None<T>(),
        ),
    );
  }
}

export class Some<T> extends Option<T> {
  match<A, B>(ifSome: (value: T) => A, _ifNone: () => B): A {
    return ifSome(this.value);
  }
  constructor(private value: T) {
    super();
  }
}

export class None<T = unknown> extends Option<T> {
  match<A, B>(_ifSome: (value: T) => A, ifNone: () => B): B {
    return ifNone();
  }
  constructor() {
    super();
  }
}
