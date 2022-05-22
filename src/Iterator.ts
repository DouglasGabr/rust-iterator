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

  filter<SubItem extends Item>(predicate: (item: Item) => boolean) {
    const self = this;
    function* process() {
      for (const value of self) {
        console.log("filter predicate", value);
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
        console.log("map predicate", value);
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
      console.log("find predicate", value);
      if (predicate(value)) {
        return value;
      }
    }
    return null;
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

const nested = iter([1, 2, iter([3, 4, 5, iter([6, 7])]), 8]);
console.log(Array.from(nested.flatten()));

const i = iter(new Array(1_000_000).fill(null).map((_, i) => i + 1))
  // .map((x) => x * 2)
  // .filter((x) => x > 2);
  .filterMap((x) => {
    const m = x * 2;
    return m > 4 ? m : null;
  });
console.log(i.find((x) => x > 6));
