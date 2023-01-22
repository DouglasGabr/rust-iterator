import { None, Option, Some } from './Option';

type FlatIterator<T> = T extends RustIterator<unknown> ? T : RustIterator<T>;

export type Ordering = -1 | 0 | 1;
function cmp<T>(a: T, b: T): Ordering {
  if (a === b) return 0;
  if (a < b) return -1;
  return 1;
}

export class RustIterator<Item> {
  constructor(private iterable: Iterator<Item>) {}

  [Symbol.iterator]() {
    return this.iterable;
  }

  next() {
    return this.iterable.next();
  }

  all(fn: (item: Item) => boolean): boolean {
    for (const value of this) {
      if (!fn(value)) {
        return false;
      }
    }
    return true;
  }

  any(predicate: (item: Item) => boolean): boolean {
    for (const value of this) {
      if (predicate(value)) {
        return true;
      }
    }
    return false;
  }

  chain(other: RustIterator<Item>): RustIterator<Item> {
    const self = this;
    function* process() {
      yield* self;
      yield* other;
    }
    return new RustIterator(process());
  }

  collect(): Item[] {
    return Array.from(this);
  }

  count(): number {
    let count = 0;
    for (const _ of this) {
      count++;
    }
    return count;
  }

  cycle(): RustIterator<Item> {
    const self = this;
    function* process() {
      let index = 0;
      let length = 0;
      const results = [];
      while (true) {
        const next = self.next();
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
    return new RustIterator(process());
  }

  enumerate(): RustIterator<[number, Item]> {
    const self = this;
    function* process() {
      let index = 0;
      for (const value of self) {
        yield [index++, value] as [number, Item];
      }
    }
    return new RustIterator(process());
  }

  eq(other: RustIterator<Item>): boolean {
    for (const value of this) {
      const otherNext = other.next();
      if (otherNext.done) {
        return false;
      }
      if (value !== otherNext.value) {
        return false;
      }
    }
    const otherDone = other.next();
    return !!otherDone.done;
  }

  fold<Result>(
    init: Result,
    predicate: (accumulator: Result, item: Item) => Result,
  ): Result {
    let accumulator = init;
    for (const value of this) {
      accumulator = predicate(accumulator, value);
    }
    return accumulator;
  }

  reduce(predicate: (accumulator: Item, item: Item) => Item): Option<Item> {
    const init = this.next();
    if (init.done) {
      return None();
    }
    return Some(this.fold(init.value, predicate));
  }

  filter<SubItem extends Item>(predicate: (item: Item) => boolean) {
    const self = this;
    function* process() {
      for (const value of self) {
        if (predicate(value)) {
          yield value as SubItem;
        }
      }
    }
    return new RustIterator<SubItem>(process());
  }

  map<OutputItem>(predicate: (item: Item) => OutputItem) {
    const self = this;
    function* process() {
      for (const value of self) {
        yield predicate(value);
      }
    }
    return new RustIterator(process());
  }

  filterMap<OutputItem>(
    predicate: (item: Item) => Option<OutputItem>,
  ): RustIterator<OutputItem> {
    return this.map(predicate)
      .filter((x) => x.isSome())
      .map((x) => x.unwrap());
  }

  find(predicate: (item: Item) => boolean): Option<Item> {
    for (const value of this) {
      if (predicate(value)) {
        return Some(value);
      }
    }
    return None();
  }

  findMap<OutputItem>(predicate: (item: Item) => Option<OutputItem>) {
    return this.map(predicate)
      .find((x) => x.isSome())
      .flatten();
  }

  flatMap<OutputItem>(predicate: (item: Item) => RustIterator<OutputItem>) {
    return this.map(predicate).flatten();
  }

  forEach(predicate: (item: Item) => unknown) {
    for (const value of this) {
      predicate(value);
    }
  }

  inspect(predicate: (item: Item) => unknown) {
    const self = this;
    function* process() {
      for (const value of self) {
        predicate(value);
        yield value;
      }
    }
    return new RustIterator(process());
  }

  last(): Option<Item> {
    let last: Option<Item> = None();
    for (const value of this) {
      last = Some(value);
    }
    return last;
  }

  mapWhile<OutputItem>(predicate: (item: Item) => Option<OutputItem>) {
    return this.map(predicate)
      .takeWhile((x) => x.isSome())
      .map((x) => x.unwrap());
  }

  max(): Option<Item> {
    return this.maxBy(cmp);
  }

  maxBy(predicate: (a: Item, b: Item) => Ordering): Option<Item> {
    return this.reduce((a, b) => {
      const res = predicate(a, b);
      return res > 0 ? a : b;
    });
  }

  maxByKey(predicate: (a: Item) => number): Option<Item> {
    return this.map((x) => [x, predicate(x)] as [Item, number])
      .maxBy((a, b) => cmp(a[1], b[1]))
      .andThen(([item]) => Some(item));
  }

  min(): Option<Item> {
    return this.minBy(cmp);
  }

  minBy(predicate: (a: Item, b: Item) => Ordering): Option<Item> {
    return this.reduce((a, b) => {
      const res = predicate(a, b);
      return res <= 0 ? a : b;
    });
  }

  minByKey(predicate: (a: Item) => number): Option<Item> {
    return this.map((x) => [x, predicate(x)] as [Item, number])
      .minBy((a, b) => cmp(a[1], b[1]))
      .andThen(([item]) => Some(item));
  }

  ne(other: RustIterator<Item>): boolean {
    return !this.eq(other);
  }

  nth(index: number): Option<Item> {
    let i = 0;
    for (const value of this) {
      if (i === index) {
        return Some(value);
      }
      i++;
    }
    return None();
  }

  partition(predicate: (item: Item) => boolean): [Item[], Item[]] {
    const a = [];
    const b = [];
    for (const value of this) {
      if (predicate(value)) {
        a.push(value);
      } else {
        b.push(value);
      }
    }
    return [a, b];
  }

  position(predicate: (item: Item) => boolean): Option<number> {
    let i = 0;
    for (const value of this) {
      if (predicate(value)) {
        return Some(i);
      }
      i++;
    }
    return None();
  }

  skip(n: number) {
    const self = this;
    function* process() {
      for (let i = 0; i < n; i++) {
        const next = self.next();
        if (next.done) {
          return;
        }
      }
      yield* self;
    }
    return new RustIterator(process());
  }

  take(n: number) {
    const self = this;
    function* process() {
      for (let i = 0; i < n; i++) {
        const next = self.next();
        if (next.done) {
          return;
        }
        yield next.value;
      }
    }
    return new RustIterator(process());
  }

  sum(this: RustIterator<number>): number {
    const init = this.next();
    if (init.done) {
      return 0;
    }
    return this.fold(init.value, (acc, value) => acc + value);
  }
  product(this: RustIterator<number>): number {
    const init = this.next();
    if (init.done) {
      return 0;
    }
    return this.fold(init.value, (acc, value) => acc * value);
  }

  scan<State, Mapped>(
    init: State,
    predicate: (state: { current: State }, item: Item) => Mapped,
  ): RustIterator<Mapped> {
    const self = this;
    const state = { current: init };
    function* process() {
      for (const value of self) {
        const mapped = predicate(state, value);
        yield mapped;
      }
    }
    return new RustIterator(process());
  }

  flatten(this: RustIterator<RustIterator<unknown>>): FlatIterator<Item> {
    const self = this;
    function* process() {
      for (const value of self) {
        yield* value;
      }
    }
    return new RustIterator(process()) as FlatIterator<Item>;
  }

  takeWhile(predicate: (item: Item) => boolean): RustIterator<Item> {
    const self = this;
    function* process() {
      for (const value of self) {
        if (!predicate(value)) {
          return;
        }
        yield value;
      }
    }
    return new RustIterator(process());
  }

  zip<OtherItem>(
    other: RustIterator<OtherItem>,
  ): RustIterator<[Item, OtherItem]> {
    const self = this;
    function* process() {
      for (const value of self) {
        const otherValue = other.next();
        if (otherValue.done) {
          return;
        }
        yield [value, otherValue.value] as [Item, OtherItem];
      }
    }
    return new RustIterator(process());
  }

  unzip<First, Second>(
    this: RustIterator<[First, Second]>,
  ): [First[], Second[]] {
    const a = [];
    const b = [];
    for (const [first, second] of this) {
      a.push(first);
      b.push(second);
    }
    return [a, b];
  }
}

export function iter<IterableItem>(
  iterable: Iterable<IterableItem>,
): RustIterator<IterableItem> {
  return new RustIterator(iterable[Symbol.iterator]());
}
