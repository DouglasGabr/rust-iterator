import { iter } from './Iterator';

type FlatOption<T> = T extends Option<unknown> ? T : Option<T>;

enum OptionType {
  Some = 'Some',
  None = 'None',
}

export class Option<T> {
  private __type: OptionType;
  private __value: T | undefined;

  private constructor(type: OptionType, value: T | undefined) {
    this.__type = type;
    this.__value = value;
  }

  static Some<T>(value: T): Option<T> {
    return new Option(OptionType.Some, value);
  }

  static None<T>(): Option<T> {
    return new Option(OptionType.None, undefined) as Option<T>;
  }

  match<A, B>(ifSome: (value: T) => A, ifNone: () => B): A | B {
    return this.isSome() ? ifSome(this.__value as T) : ifNone();
  }

  unwrap(): T {
    return this.expect('called Option.unwrap() on a None value');
  }

  unwrapOr(defaultValue: T): T {
    return this.unwrapOrElse(() => defaultValue);
  }

  unwrapOrElse(defaultFn: () => T): T {
    return this.match(
      (value) => value,
      () => defaultFn(),
    );
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
      (value) => (predicate(value) ? this : Option.None<T>()),
      () => Option.None<T>(),
    );
  }
  flatten(this: Option<Option<unknown>>): FlatOption<T> {
    return this.match(
      (value) => value as FlatOption<T>,
      () => Option.None<T>() as FlatOption<T>,
    );
  }
  map<U>(fn: (value: T) => U): Option<U> {
    return this.match(
      (value) => Option.Some(fn(value)),
      () => Option.None<U>(),
    );
  }
  mapOr<U>(defaultValue: U, fn: (value: T) => U): U {
    return this.mapOrElse(() => defaultValue, fn);
  }
  mapOrElse<U>(defaultFn: () => U, mapFn: (value: T) => U): U {
    return this.match(
      (value) => mapFn(value),
      () => defaultFn(),
    );
  }

  iter() {
    return this.match(
      (value) => iter([value]),
      () => iter([]),
    );
  }

  and<U>(other: Option<U>): Option<U> {
    return this.match(
      () => other,
      () => Option.None<U>(),
    );
  }
  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return this.match(fn, () => Option.None<U>());
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
  isNone() {
    return this.__type === OptionType.None;
  }
  isSome() {
    return this.__type === OptionType.Some;
  }
  zip<U>(other: Option<U>): Option<[T, U]> {
    return this.match(
      (value) => other.map((otherValue) => [value, otherValue]),
      () => Option.None<[T, U]>(),
    );
  }
  unzip<U, V>(this: Option<[U, V]>): [Option<U>, Option<V>] {
    return this.match(
      ([u, v]) => [Option.Some(u), Option.Some(v)],
      () => [Option.None<U>(), Option.None<V>()],
    );
  }
  xor(other: Option<T>): Option<T> {
    return this.match(
      () =>
        other.match(
          () => Option.None<T>(),
          () => this,
        ),
      () =>
        other.match(
          () => other,
          () => Option.None<T>(),
        ),
    );
  }
  getOrInsert(value: T): T {
    return this.getOrInsertWith(() => value);
  }
  getOrInsertWith(fn: () => T): T {
    return this.match(
      (value) => value,
      () => {
        const value = fn();
        this.__type = OptionType.Some;
        this.__value = value;
        return value;
      },
    );
  }
  insert(value: T): T {
    this.__type = OptionType.Some;
    this.__value = value;
    return value;
  }
  replace(value: T): Option<T> {
    const old = this.match(
      (value) => Option.Some(value),
      () => Option.None<T>(),
    );
    this.__type = OptionType.Some;
    this.__value = value;
    return old;
  }
  take(): Option<T> {
    return this.match(
      (value) => {
        this.__type = OptionType.None;
        this.__value = undefined;
        return Option.Some(value);
      },
      () => Option.None<T>(),
    );
  }
}

export const Some = Option.Some.bind(Option);
// prettier-ignore
export const None = (Option.None.bind(Option))<never>;
