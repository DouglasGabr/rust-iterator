import { None, Option, Some } from './Option';
import { cmp, Ordering } from './utils';

export class AsyncIter<T> {
  private constructor(private iterable: AsyncIterator<T>) {}

  [Symbol.asyncIterator]() {
    return this.iterable;
  }

  next() {
    return this.iterable.next();
  }

  async all(fn: (item: T) => boolean): Promise<boolean> {
    for await (const value of this) {
      if (!fn(value)) {
        return false;
      }
    }
    return true;
  }

  async any(fn: (item: T) => boolean): Promise<boolean> {
    for await (const value of this) {
      if (fn(value)) {
        return true;
      }
    }
    return false;
  }

  chain(other: AsyncIter<T>): AsyncIter<T> {
    const self = this;
    async function* process() {
      yield* self;
      yield* other;
    }
    return new AsyncIter(process());
  }

  async collect(): Promise<T[]> {
    const result = [];
    for await (const value of this) {
      result.push(value);
    }
    return result;
  }

  async count(): Promise<number> {
    let count = 0;
    for await (const _ of this) {
      count++;
    }
    return count;
  }

  cycle(): AsyncIter<T> {
    const self = this;
    async function* process() {
      let index = 0;
      let length = 0;
      const results = [];
      while (true) {
        const next = await self.next();
        if (!next.done) {
          length++;
          index = (index + 1) % length;
          results[index] = next.value;
        } else {
          if (length === 0) {
            return;
          }
          index = (index + 1) % length;
        }
        yield results[index];
      }
    }
    return new AsyncIter(process());
  }

  enumerate(): AsyncIter<[number, T]> {
    const self = this;
    async function* process() {
      let index = 0;
      for await (const value of self) {
        yield [index++, value] as [number, T];
      }
    }
    return new AsyncIter(process());
  }

  async eq(other: AsyncIter<T>): Promise<boolean> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [thisNext, otherNext] = await Promise.all([
        this.next(),
        other.next(),
      ]);
      if (thisNext.done && otherNext.done) {
        return true;
      }
      if (thisNext.done || otherNext.done) {
        return false;
      }
      if (thisNext.value !== otherNext.value) {
        return false;
      }
    }
  }

  async fold<R>(initial: R, fn: (acc: R, item: T) => R): Promise<R> {
    let accumulator = initial;
    for await (const value of this) {
      accumulator = fn(accumulator, value);
    }
    return accumulator;
  }

  async reduce(fn: (acc: T, item: T) => T): Promise<Option<T>> {
    const next = await this.next();
    if (next.done) {
      return None();
    }
    return Some(await this.fold(next.value, fn));
  }

  filter<U extends T>(fn: (item: T) => boolean): AsyncIter<U> {
    const self = this;
    async function* process() {
      for await (const value of self) {
        if (fn(value)) {
          yield value as U;
        }
      }
    }
    return new AsyncIter(process());
  }

  filterMap<U>(fn: (item: T) => Option<U>): AsyncIter<U> {
    return this.map(fn)
      .filter((item) => item.isSome())
      .map((item) => item.unwrap());
  }

  async find(fn: (item: T) => boolean): Promise<Option<T>> {
    for await (const value of this) {
      if (fn(value)) {
        return Some(value);
      }
    }
    return None();
  }

  async findMap<U>(fn: (item: T) => Option<U>): Promise<Option<U>> {
    return (await this.map(fn).find((item) => item.isSome())).flatten();
  }

  map<U>(fn: (item: T) => U): AsyncIter<Awaited<U>> {
    const self = this;
    async function* process() {
      for await (const value of self) {
        yield fn(value);
      }
    }
    return new AsyncIter(process());
  }

  flatten<U>(this: AsyncIter<AsyncIter<U>>): AsyncIter<U> {
    const self = this;
    async function* process() {
      for await (const iter of self) {
        yield* iter;
      }
    }
    return new AsyncIter(process());
  }

  flatMap<U>(fn: (item: T) => AsyncIter<U>): AsyncIter<U> {
    return this.map(fn).flatten();
  }

  async forEach(predicate: (item: T) => unknown) {
    for await (const value of this) {
      predicate(value);
    }
  }

  inspect(predicate: (item: T) => unknown) {
    const self = this;
    async function* process() {
      for await (const value of self) {
        predicate(value);
        yield value;
      }
    }
    return new AsyncIter(process());
  }

  async last(): Promise<Option<T>> {
    let last: Option<T> = None();
    for await (const value of this) {
      last = Some(value);
    }
    return last;
  }

  takeWhile(predicate: (item: T) => boolean): AsyncIter<T> {
    const self = this;
    async function* process() {
      for await (const value of self) {
        if (!predicate(value)) {
          return;
        }
        yield value;
      }
    }
    return new AsyncIter(process());
  }

  mapWhile<U>(predicate: (item: T) => Option<U>): AsyncIter<U> {
    return this.map(predicate)
      .takeWhile((x) => x.isSome())
      .map((x) => x.unwrap());
  }

  async maxBy(predicate: (a: T, b: T) => Ordering): Promise<Option<T>> {
    return await this.reduce((a, b) => {
      const res = predicate(a, b);
      return res === Ordering.Greater ? a : b;
    });
  }

  async max(): Promise<Option<T>> {
    return await this.maxBy(cmp);
  }

  async maxByKey(fn: (a: T) => number): Promise<Option<T>> {
    return await this.maxBy((a, b) => cmp(fn(a), fn(b)));
  }

  async minBy(predicate: (a: T, b: T) => Ordering): Promise<Option<T>> {
    return await this.reduce((a, b) => {
      const res = predicate(a, b);
      return res === Ordering.Less ? a : b;
    });
  }

  async min(): Promise<Option<T>> {
    return await this.minBy(cmp);
  }

  async minByKey(fn: (a: T) => number): Promise<Option<T>> {
    return await this.minBy((a, b) => cmp(fn(a), fn(b)));
  }

  async ne(other: AsyncIter<T>): Promise<boolean> {
    return !(await this.eq(other));
  }

  async nth(index: number): Promise<Option<T>> {
    for await (const value of this) {
      if (index === 0) {
        return Some(value);
      }
      --index;
    }
    return None();
  }

  async partition(fn: (item: T) => boolean): Promise<[T[], T[]]> {
    const a = [];
    const b = [];
    for await (const value of this) {
      if (fn(value)) {
        a.push(value);
      } else {
        b.push(value);
      }
    }
    return [a, b];
  }

  skip(n: number): AsyncIter<T> {
    const self = this;
    async function* process() {
      for (let i = 0; i < n; i++) {
        const next = await self.next();
        if (next.done) {
          return;
        }
      }
      yield* self;
    }
    return new AsyncIter(process());
  }

  take(n: number) {
    const self = this;
    async function* process() {
      for (let i = 0; i < n; i++) {
        const next = await self.next();
        if (next.done) {
          return;
        }
        yield next.value;
      }
    }
    return new AsyncIter(process());
  }

  sum(this: AsyncIter<number>): Promise<number> {
    return this.fold(0, (a, b) => a + b);
  }

  product(this: AsyncIter<number>): Promise<number> {
    return this.fold(1, (a, b) => a * b);
  }

  scan<State, Mapped>(
    init: State,
    fn: (state: { current: State }, item: T) => Mapped,
  ): AsyncIter<Mapped> {
    const self = this;
    const state = { current: init };
    async function* process() {
      for await (const value of self) {
        const mapped = fn(state, value);
        yield mapped;
      }
    }
    return new AsyncIter(process());
  }

  zip<U>(other: AsyncIter<U>): AsyncIter<[T, U]> {
    const self = this;
    async function* process() {
      for await (const a of self) {
        const b = await other.next();
        if (b.done) {
          return;
        }
        yield [a, b.value] as [T, U];
      }
    }
    return new AsyncIter(process());
  }

  async unzip<U, V>(this: AsyncIter<[U, V]>): Promise<[U[], V[]]> {
    const a = [];
    const b = [];
    for await (const [x, y] of this) {
      a.push(x);
      b.push(y);
    }
    return [a, b];
  }

  static from<T>(iterable: Iterable<T>): AsyncIter<Awaited<T>> {
    async function* process() {
      for await (const value of iterable) {
        yield value;
      }
    }
    return new AsyncIter(process());
  }
}
