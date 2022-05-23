type FlatRustIterator<Iter, Depth extends number> = {
  done: Iter;
  recur: Iter extends RustIterator<infer InnerIter>
    ? FlatRustIterator<InnerIter, [-1, 0][Depth]>
    : Iter;
}[Depth extends -1 ? "done" : "recur"];

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
}

export function iter<IterableItem>(
  iterable: Iterable<IterableItem>
): RustIterator<IterableItem> {
  return new RustIterator(iterable[Symbol.iterator]());
}
