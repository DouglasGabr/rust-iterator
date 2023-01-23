export class AsyncIter<T> {
  private constructor(private iterable: AsyncIterator<T>) {}

  [Symbol.asyncIterator]() {
    return this.iterable;
  }

  next() {
    return this.iterable.next();
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

  static from<T>(iterable: Iterable<T>): AsyncIter<Awaited<T>> {
    async function* process() {
      for await (const value of iterable) {
        yield value;
      }
    }
    return new AsyncIter(process());
  }
}
