type FlatRustIterator<Iter, Depth extends number> = {
  done: Iter;
  recur: Iter extends RustIterator<infer InnerIter>
    ? FlatRustIterator<InnerIter, [-1, 0][Depth]>
    : Iter;
}[Depth extends -1 ? "done" : "recur"];

export type Ordering = -1 | 0 | 1;
function cmp<T>(a: T, b: T): Ordering {
  if (a === b) return 0;
  if (a < b) return -1;
  return 1;
}

class RustIterator<Item> {
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
    predicate: (accumulator: Result, item: Item) => Result
  ): Result {
    let accumulator = init;
    for (const value of this) {
      accumulator = predicate(accumulator, value);
    }
    return accumulator;
  }

  reduce(predicate: (accumulator: Item, item: Item) => Item): Item | null {
    const init = this.next();
    if (init.done) {
      return null;
    }
    return this.fold(init.value, predicate);
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

  filterMap<OutputItem>(predicate: (item: Item) => OutputItem | null) {
    return this.map(predicate).filter<OutputItem>((x) => x !== null);
  }

  find(predicate: (item: Item) => boolean) {
    for (const value of this) {
      if (predicate(value)) {
        return value;
      }
    }
    return null;
  }

  findMap<OutputItem>(predicate: (item: Item) => OutputItem | null) {
    for (const value of this) {
      const mapped = predicate(value);
      if (mapped !== null) {
        return mapped;
      }
    }
    return null;
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

  last(): Item | null {
    let last: Item | null = null;
    for (const value of this) {
      last = value;
    }
    return last;
  }

  mapWhile<OutputItem>(predicate: (item: Item) => OutputItem | null) {
    return this.map(predicate).takeWhile((x) => x !== null);
  }

  max(): Item | null {
    return this.maxBy(cmp);
  }

  maxBy(predicate: (a: Item, b: Item) => Ordering): Item | null {
    return this.reduce((a, b) => {
      const res = predicate(a, b);
      return res > 0 ? a : b;
    });
  }

  maxByKey(predicate: (a: Item) => number): Item | null {
    return (
      this.map((x) => [x, predicate(x)] as [Item, number]).maxBy((a, b) =>
        cmp(a[1], b[1])
      )?.[0] ?? null
    );
  }

  min(): Item | null {
    return this.minBy(cmp);
  }

  minBy(predicate: (a: Item, b: Item) => Ordering): Item | null {
    return this.reduce((a, b) => {
      const res = predicate(a, b);
      return res <= 0 ? a : b;
    });
  }

  minByKey(predicate: (a: Item) => number): Item | null {
    return (
      this.map((x) => [x, predicate(x)] as [Item, number]).minBy((a, b) =>
        cmp(a[1], b[1])
      )?.[0] ?? null
    );
  }

  ne(other: RustIterator<Item>): boolean {
    return !this.eq(other);
  }

  nth(index: number): Item | null {
    let i = 0;
    for (const value of this) {
      if (i === index) {
        return value;
      }
      i++;
    }
    return null;
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

  position(predicate: (item: Item) => boolean) {
    let i = 0;
    for (const value of this) {
      if (predicate(value)) {
        return i;
      }
      i++;
    }
    return null;
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

  sum(): number {
    const init = this.next().value;
    if (init.done) {
      return 0;
    }
    if (typeof init.value === "number") {
      return this.fold(init.value, (acc, value) => acc + value);
    }
    throw new TypeError("Cannot sum iterator of non-numeric values");
  }
  product(): number {
    const init = this.next().value;
    if (init.done) {
      return 0;
    }
    if (typeof init.value === "number") {
      return this.fold(
        init.value,
        (acc, value) => acc * (value as unknown as number)
      );
    }
    throw new TypeError("Cannot multiply iterator of non-numeric values");
  }

  scan<State, Mapped>(
    init: State,
    predicate: (state: { current: State }, item: Item) => Mapped
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

  flatten(): RustIterator<FlatRustIterator<Item, 0>> {
    const self = this;
    function* process(): Generator<FlatRustIterator<Item, 0>, any, undefined> {
      for (const value of self) {
        if (value instanceof RustIterator) {
          yield* value;
        } else {
          yield value as FlatRustIterator<Item, 0>;
        }
      }
    }
    return new RustIterator(process());
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
    other: RustIterator<OtherItem>
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
    this: RustIterator<[First, Second]>
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
  iterable: Iterable<IterableItem>
): RustIterator<IterableItem> {
  return new RustIterator(iterable[Symbol.iterator]());
}
