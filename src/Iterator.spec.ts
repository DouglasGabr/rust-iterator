import { Iter } from './Iterator';
import { None, Some } from './Option';
import { Ordering } from './utils';

describe('Iterator', () => {
  describe('.all()', () => {
    it('should return true if all items match the predicate', () => {
      const iterator = Iter.from([1, 2, 3]);
      expect(iterator.all((x) => x < 4)).toBe(true);
    });
    it('should return false if any item does not match the predicate', () => {
      const iterator = Iter.from([1, 2, 3]);
      expect(iterator.all((x) => x < 2)).toBe(false);
    });
    it('.next() should keep processing if result is false', () => {
      const iterator = Iter.from([1, 2, 3, 4, 5]);
      iterator.all((x) => x < 3);
      const next = iterator.next();
      expect(next).toStrictEqual({
        done: false,
        value: 4,
      });
    });
  });
  describe('.any()', () => {
    it('should return true if any item matches the predicate', () => {
      const iterator = Iter.from([1, 2, 3]);
      expect(iterator.any((x) => x === 2)).toBe(true);
    });
    it('should return false if no item matches the predicate', () => {
      const iterator = Iter.from([1, 2, 3]);
      expect(iterator.any((x) => x === 4)).toBe(false);
    });
    it('.next() should keep processing if result is true', () => {
      const iterator = Iter.from([1, 2, 3, 4, 5]);
      iterator.any((x) => x === 3);
      const next = iterator.next();
      expect(next).toStrictEqual({
        done: false,
        value: 4,
      });
    });
  });
  describe('.chain()', () => {
    it('should chain 2 iterators', () => {
      // arrange
      const a1 = Iter.from([1, 2, 3]);
      const a2 = Iter.from([4, 5, 6]);
      // act
      const result = a1.chain(a2);
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: 1 });
      expect(result.next()).toStrictEqual({ done: false, value: 2 });
      expect(result.next()).toStrictEqual({ done: false, value: 3 });
      expect(result.next()).toStrictEqual({ done: false, value: 4 });
      expect(result.next()).toStrictEqual({ done: false, value: 5 });
      expect(result.next()).toStrictEqual({ done: false, value: 6 });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.collect()', () => {
    it('should return array of items', () => {
      // arrange
      const a1 = Iter.from([1, 2, 3]);
      // act
      const result = a1.collect();
      // assert
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual([1, 2, 3]);
    });
  });
  describe('.count()', () => {
    it('should return size of iterator', () => {
      // arrange
      const a1 = Iter.from([1, 2, 3]);
      // act
      const result = a1.count();
      // assert
      expect(result).toBe(3);
    });
  });
  describe('.cycle()', () => {
    it('should return infinite iterator', () => {
      // arrange
      const a1 = Iter.from([1, 2, 3]);
      // act
      const result = a1.cycle();
      // assert
      expect(result.next()).toStrictEqual({
        done: false,
        value: 1,
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: 2,
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: 3,
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: 1,
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: 2,
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: 3,
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: 1,
      });
    });
    describe('empty iterator', () => {
      it('should return empty iterator', () => {
        // arrange
        const a1 = Iter.from([]);
        // act
        const result = a1.cycle();
        // assert
        expect(result.next()).toStrictEqual({
          done: true,
          value: undefined,
        });
      });
    });
  });
  describe('.enumerate()', () => {
    it('should return key value pair iterator', () => {
      // arrange
      const a1 = Iter.from(['a', 'b', 'c']);
      // act
      const result = a1.enumerate();
      // assert
      expect(result.next()).toStrictEqual({
        done: false,
        value: [0, 'a'],
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: [1, 'b'],
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: [2, 'c'],
      });
      expect(result.next()).toStrictEqual({
        done: true,
        value: undefined,
      });
    });
  });
  describe('.fold()', () => {
    it('should fold iterator into one value', () => {
      // arrange
      const a = Iter.from([1, 2, 3]);
      // act
      const result = a.fold(0, (acc, x) => acc + x);
      // assert
      expect(result).toBe(6);
    });
  });
  describe('.reduce()', () => {
    it('should reduce iterator into one value', () => {
      // arrange
      const a = Iter.from([1, 2, 3]);
      // act
      const result = a.reduce((acc, x) => acc + x);
      // assert
      expect(result).toStrictEqual(Some(6));
    });
    it('should return None if iterator is empty', () => {
      // arrange
      const a = Iter.from<number>([]);
      // act
      const result = a.reduce((acc, x) => acc + x);
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.scan()', () => {
    it('should work', () => {
      // arrange
      const a = Iter.from([1, 2, 3]);
      // act
      const result = a.scan(1, (state, x) => {
        state.current = state.current * x;
        return state.current * -1;
      });
      // assert
      expect(result.next()).toStrictEqual({
        done: false,
        value: -1,
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: -2,
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: -6,
      });
      expect(result.next()).toStrictEqual({
        done: true,
        value: undefined,
      });
    });
  });
  describe('.eq()', () => {
    describe('empty iterators', () => {
      it('should return true', () => {
        // arrange
        const a1 = Iter.from([]);
        const a2 = Iter.from([]);
        // act
        const result = a1.eq(a2);
        // assert
        expect(result).toBe(true);
      });
    });
    describe('iterator 1 is empty', () => {
      describe('iterator 2 is not empty', () => {
        it('should return false', () => {
          // arrange
          const a1 = Iter.from<number>([]);
          const a2 = Iter.from([1, 2, 3]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(false);
        });
      });
    });
    describe('iterator 2 is empty', () => {
      describe('iterator 1 is not empty', () => {
        it('should return false', () => {
          // arrange
          const a1 = Iter.from([1, 2, 3]);
          const a2 = Iter.from<number>([]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(false);
        });
      });
    });
    describe('iterators are not empty', () => {
      describe('iterators are equal', () => {
        it('should return true', () => {
          // arrange
          const a1 = Iter.from([1, 2, 3]);
          const a2 = Iter.from([1, 2, 3]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(true);
        });
      });
      describe('iterator 2 is bigger than 1', () => {
        it('should return false', () => {
          // arrange
          const a1 = Iter.from([1, 2, 3]);
          const a2 = Iter.from([1, 2, 3, 4]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(false);
        });
      });
      describe('iterator 2 is smaller than 1', () => {
        it('should return false', () => {
          // arrange
          const a1 = Iter.from([1, 2, 3]);
          const a2 = Iter.from([1, 2]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(false);
        });
      });
      describe('iterator 2 is different than 1', () => {
        it('should return false', () => {
          // arrange
          const a1 = Iter.from([1, 2, 3]);
          const a2 = Iter.from([1, 2, 5]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(false);
        });
      });
    });
  });
  describe('.inspect()', () => {
    it('should inspect', () => {
      // arrange
      const a = Iter.from([1, 4, 2, 3]);
      const log = jest.fn();
      // act
      const _sum = a
        .inspect((x) => log(`about to filter: ${x}`))
        .filter((x) => x % 2 === 0)
        .inspect((x) => log(`made it through filter: ${x}`))
        .fold(0, (sum, i) => sum + i);
      // assert
      expect(log).toHaveBeenNthCalledWith(1, 'about to filter: 1');
      expect(log).toHaveBeenNthCalledWith(2, 'about to filter: 4');
      expect(log).toHaveBeenNthCalledWith(3, 'made it through filter: 4');
      expect(log).toHaveBeenNthCalledWith(4, 'about to filter: 2');
      expect(log).toHaveBeenNthCalledWith(5, 'made it through filter: 2');
      expect(log).toHaveBeenNthCalledWith(6, 'about to filter: 3');
    });
  });
  describe('.map()', () => {
    it('should map values', () => {
      // arrange
      const a = Iter.from([1, 2, 3]);
      // act
      const result = a.map((x) => x * 2);
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: 2 });
      expect(result.next()).toStrictEqual({ done: false, value: 4 });
      expect(result.next()).toStrictEqual({ done: false, value: 6 });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.filterMap()', () => {
    it('should filter and map values', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.filterMap((x) => (x % 2 === 0 ? Some(x * 2) : None()));
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: 4 });
      expect(result.next()).toStrictEqual({ done: false, value: 8 });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.find()', () => {
    it('should find', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.find((x) => x % 2 === 0);
      // assert
      expect(result).toStrictEqual(Some(2));
    });
    it('should return None if not found', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.find((x) => x % 5 === 0);
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.findMap()', () => {
    it('should find and map', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.findMap((x) => (x % 2 === 0 ? Some(x * 2) : None()));
      // assert
      expect(result).toStrictEqual(Some(4));
    });
    it('should return None if not found', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.findMap((x) => (x % 5 === 0 ? Some(x * 2) : None()));
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.flatten()', () => {
    it('should flatten', () => {
      // arrange
      const a = Iter.from('abc\n123'.split('\n')).map((i) =>
        Iter.from(i.split('')),
      );
      // act
      const result = a.flatten();
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: 'a' });
      expect(result.next()).toStrictEqual({ done: false, value: 'b' });
      expect(result.next()).toStrictEqual({ done: false, value: 'c' });
      expect(result.next()).toStrictEqual({ done: false, value: '1' });
      expect(result.next()).toStrictEqual({ done: false, value: '2' });
      expect(result.next()).toStrictEqual({ done: false, value: '3' });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.flatMap()', () => {
    it('should flatMap', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.flatMap((x) => Iter.from([x, x * 2]));
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: 1 });
      expect(result.next()).toStrictEqual({ done: false, value: 2 });
      expect(result.next()).toStrictEqual({ done: false, value: 2 });
      expect(result.next()).toStrictEqual({ done: false, value: 4 });
      expect(result.next()).toStrictEqual({ done: false, value: 3 });
      expect(result.next()).toStrictEqual({ done: false, value: 6 });
      expect(result.next()).toStrictEqual({ done: false, value: 4 });
      expect(result.next()).toStrictEqual({ done: false, value: 8 });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.forEach()', () => {
    it('should iterate', () => {
      // arrange
      const a = Iter.from([1, 2, 3]);
      const log = jest.fn();
      // act
      a.forEach((x) => log(x));
      // assert
      expect(log).toHaveBeenNthCalledWith(1, 1);
      expect(log).toHaveBeenNthCalledWith(2, 2);
      expect(log).toHaveBeenNthCalledWith(3, 3);
      expect(a.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.last()', () => {
    it('should return last element', () => {
      // arrange
      const a = Iter.from([1, 2, 3]);
      // act
      const result = a.last();
      // assert
      expect(result).toStrictEqual(Some(3));
    });
    it('should return None if empty', () => {
      // arrange
      const a = Iter.from([]);
      // act
      const result = a.last();
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.takeWhile()', () => {
    it('should take while', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.takeWhile((x) => x < 3);
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: 1 });
      expect(result.next()).toStrictEqual({ done: false, value: 2 });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.mapWhile()', () => {
    it('should map while', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.mapWhile((x) => (x < 3 ? Some(x * 2) : None()));
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: 2 });
      expect(result.next()).toStrictEqual({ done: false, value: 4 });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.maxBy()', () => {
    it('should return max by', () => {
      // arrange
      const a = Iter.from([1, 1, 3, 2, 3, 4]);
      // act
      const result = a.maxBy((a, b) =>
        a === b ? Ordering.Equal : a > b ? Ordering.Greater : Ordering.Less,
      );
      // assert
      expect(result).toStrictEqual(Some(4));
    });
    it('should return None if empty', () => {
      // arrange
      const a = Iter.from<number>([]);
      // act
      const result = a.maxBy((a, b) =>
        a === b ? Ordering.Equal : a > b ? Ordering.Greater : Ordering.Less,
      );
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.max()', () => {
    it('should return max', () => {
      // arrange
      const a = Iter.from([1, 1, 2, 2, 3, 4]);
      // act
      const result = a.max();
      // assert
      expect(result).toStrictEqual(Some(4));
    });
    it('should return None if empty', () => {
      // arrange
      const a = Iter.from<number>([]);
      // act
      const result = a.max();
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.maxByKey()', () => {
    it('should return max by key', () => {
      // arrange
      const a = Iter.from([{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }]);
      // act
      const result = a.maxByKey((x) => x.a);
      // assert
      expect(result).toStrictEqual(Some({ a: 4 }));
    });
    it('should return None if empty', () => {
      // arrange
      const a = Iter.from<{ a: number }>([]);
      // act
      const result = a.maxByKey((x) => x.a);
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.minBy()', () => {
    it('should return min by', () => {
      // arrange
      const a = Iter.from([4, 4, 1, 1, 3, 3, 2, 2, 3, 4]);
      // act
      const result = a.minBy((a, b) =>
        a === b ? Ordering.Equal : a > b ? Ordering.Greater : Ordering.Less,
      );
      // assert
      expect(result).toStrictEqual(Some(1));
    });
    it('should return None if empty', () => {
      // arrange
      const a = Iter.from<number>([]);
      // act
      const result = a.minBy((a, b) =>
        a === b ? Ordering.Equal : a > b ? Ordering.Greater : Ordering.Less,
      );
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.min()', () => {
    it('should return min', () => {
      // arrange
      const a = Iter.from([4, 4, 1, 1, 2, 3, 4]);
      // act
      const result = a.min();
      // assert
      expect(result).toStrictEqual(Some(1));
    });
    it('should return None if empty', () => {
      // arrange
      const a = Iter.from<number>([]);
      // act
      const result = a.min();
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.minByKey()', () => {
    it('should return min by key', () => {
      // arrange
      const a = Iter.from([{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }]);
      // act
      const result = a.minByKey((x) => x.a);
      // assert
      expect(result).toStrictEqual(Some({ a: 1 }));
    });
    it('should return None if empty', () => {
      // arrange
      const a = Iter.from<{ a: number }>([]);
      // act
      const result = a.minByKey((x) => x.a);
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.ne()', () => {
    it('should return true if not equal', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.ne(Iter.from([1, 2, 3]));
      // assert
      expect(result).toBeTruthy();
    });
    it('should return false if equal', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.ne(Iter.from([1, 2, 3, 4]));
      // assert
      expect(result).toBeFalsy();
    });
  });
  describe('.nth()', () => {
    it('should return nth', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.nth(2);
      // assert
      expect(result).toStrictEqual(Some(3));
    });
    it('should return None if empty', () => {
      // arrange
      const a = Iter.from<number>([]);
      // act
      const result = a.nth(2);
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.partition()', () => {
    it('should partition', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.partition((x) => x % 2 === 0);
      // assert
      expect(result).toStrictEqual([
        [2, 4],
        [1, 3],
      ]);
    });
  });
  describe('.position()', () => {
    it('should return position', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.position((x) => x === 3);
      // assert
      expect(result).toStrictEqual(Some(2));
    });
    it('should return None if not found', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.position((x) => x === 5);
      // assert
      expect(result).toStrictEqual(None());
    });
  });
  describe('.skip()', () => {
    it('should skip', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.skip(2);
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: 3 });
    });
    it('should return empty if skip is greater than length', () => {
      // arrange
      const a = Iter.from<number>([1, 2]);
      // act
      const result = a.skip(3);
      // assert
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.take()', () => {
    it('should take', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.take(2);
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: 1 });
      expect(result.next()).toStrictEqual({ done: false, value: 2 });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
    it('should stop early if "take" is greater than length', () => {
      // arrange
      const a = Iter.from<number>([1, 2]);
      // act
      const result = a.take(3);
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: 1 });
      expect(result.next()).toStrictEqual({ done: false, value: 2 });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.sum()', () => {
    it('should sum', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.sum();
      // assert
      expect(result).toStrictEqual(10);
    });
    it('should return 0 if empty', () => {
      // arrange
      const a = Iter.from<number>([]);
      // act
      const result = a.sum();
      // assert
      expect(result).toStrictEqual(0);
    });
  });
  describe('.product()', () => {
    it('should product', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      // act
      const result = a.product();
      // assert
      expect(result).toStrictEqual(24);
    });
    it('should return 1 if empty', () => {
      // arrange
      const a = Iter.from<number>([]);
      // act
      const result = a.product();
      // assert
      expect(result).toStrictEqual(1);
    });
  });
  describe('.zip()', () => {
    it('should zip', () => {
      // arrange
      const a = Iter.from([1, 2, 3, 4]);
      const b = Iter.from([5, 6, 7, 8]);
      // act
      const result = a.zip(b);
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: [1, 5] });
      expect(result.next()).toStrictEqual({ done: false, value: [2, 6] });
      expect(result.next()).toStrictEqual({ done: false, value: [3, 7] });
      expect(result.next()).toStrictEqual({ done: false, value: [4, 8] });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
    it('should stop early if first iterator is shorter than second', () => {
      // arrange
      const a = Iter.from([1, 2]);
      const b = Iter.from([5, 6, 7, 8]);
      // act
      const result = a.zip(b);
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: [1, 5] });
      expect(result.next()).toStrictEqual({ done: false, value: [2, 6] });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
    it('should stop early if second iterator is shorter than first', () => {
      // arrange
      const a = Iter.from([5, 6, 7, 8]);
      const b = Iter.from([1, 2]);
      // act
      const result = a.zip(b);
      // assert
      expect(result.next()).toStrictEqual({ done: false, value: [5, 1] });
      expect(result.next()).toStrictEqual({ done: false, value: [6, 2] });
      expect(result.next()).toStrictEqual({ done: true, value: undefined });
    });
  });
  describe('.unzip()', () => {
    it('should unzip', () => {
      // arrange
      const a = Iter.from<[number, number]>([
        [1, 5],
        [2, 6],
        [3, 7],
        [4, 8],
      ]);
      // act
      const result = a.unzip();
      // assert
      expect(result).toEqual([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
      ]);
    });
  });
  describe('.toAsync()', () => {
    it('should transform Iter<Promise<T>> to AsyncIter<T>', async () => {
      const iter = Iter.from([Promise.resolve(1), Promise.resolve(2)]);
      const asyncIter = iter.toAsync();
      await expect(asyncIter.next()).resolves.toStrictEqual({
        done: false,
        value: 1,
      });
      await expect(asyncIter.next()).resolves.toStrictEqual({
        done: false,
        value: 2,
      });
    });
  });
});
