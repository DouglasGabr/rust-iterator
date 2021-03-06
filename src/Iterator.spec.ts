import { iter } from "./Iterator";

describe("Iterator", () => {
  describe(".all()", () => {
    it("should return true if all items match the predicate", () => {
      const iterator = iter([1, 2, 3]);
      expect(iterator.all((x) => x < 4)).toBe(true);
    });
    it("should return false if any item does not match the predicate", () => {
      const iterator = iter([1, 2, 3]);
      expect(iterator.all((x) => x < 2)).toBe(false);
    });
    it(".next() should keep processing if result is false", () => {
      const iterator = iter([1, 2, 3, 4, 5]);
      iterator.all((x) => x < 3);
      const next = iterator.next();
      expect(next).toStrictEqual({
        done: false,
        value: 4,
      });
    });
  });
  describe(".chain()", () => {
    it("should chain 2 iterators", () => {
      // arrange
      const a1 = iter([1, 2, 3]);
      const a2 = iter([4, 5, 6]);
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
  describe(".collect()", () => {
    it("should return array of items", () => {
      // arrange
      const a1 = iter([1, 2, 3]);
      // act
      const result = a1.collect();
      // assert
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual([1, 2, 3]);
    });
  });
  describe(".count()", () => {
    it("should return size of iterator", () => {
      // arrange
      const a1 = iter([1, 2, 3]);
      // act
      const result = a1.count();
      // assert
      expect(result).toBe(3);
    });
  });
  describe(".cycle()", () => {
    it("should return infinite iterator", () => {
      // arrange
      const a1 = iter([1, 2, 3]);
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
    describe("empty iterator", () => {
      it("should return empty iterator", () => {
        // arrange
        const a1 = iter([]);
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
  describe(".enumerate()", () => {
    it("should return key value pair iterator", () => {
      // arrange
      const a1 = iter(["a", "b", "c"]);
      // act
      const result = a1.enumerate();
      // assert
      expect(result.next()).toStrictEqual({
        done: false,
        value: [0, "a"],
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: [1, "b"],
      });
      expect(result.next()).toStrictEqual({
        done: false,
        value: [2, "c"],
      });
      expect(result.next()).toStrictEqual({
        done: true,
        value: undefined,
      });
    });
  });
  describe(".fold()", () => {
    it("should fold iterator into one value", () => {
      // arrange
      const a = iter([1, 2, 3]);
      // act
      const result = a.fold(0, (acc, x) => acc + x);
      // assert
      expect(result).toBe(6);
    });
  });
  describe(".scan()", () => {
    it("should work", () => {
      // arrange
      const a = iter([1, 2, 3]);
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
  describe(".eq()", () => {
    describe("empty iterators", () => {
      it("should return true", () => {
        // arrange
        const a1 = iter([]);
        const a2 = iter([]);
        // act
        const result = a1.eq(a2);
        // assert
        expect(result).toBe(true);
      });
    });
    describe("iterator 1 is empty", () => {
      describe("iterator 2 is not empty", () => {
        it("should return false", () => {
          // arrange
          const a1 = iter<number>([]);
          const a2 = iter([1, 2, 3]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(false);
        });
      });
    });
    describe("iterator 2 is empty", () => {
      describe("iterator 1 is not empty", () => {
        it("should return false", () => {
          // arrange
          const a1 = iter([1, 2, 3]);
          const a2 = iter<number>([]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(false);
        });
      });
    });
    describe("iterators are not empty", () => {
      describe("iterators are equal", () => {
        it("should return true", () => {
          // arrange
          const a1 = iter([1, 2, 3]);
          const a2 = iter([1, 2, 3]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(true);
        });
      });
      describe("iterator 2 is bigger than 1", () => {
        it("should return false", () => {
          // arrange
          const a1 = iter([1, 2, 3]);
          const a2 = iter([1, 2, 3, 4]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(false);
        });
      });
      describe("iterator 2 is smaller than 1", () => {
        it("should return false", () => {
          // arrange
          const a1 = iter([1, 2, 3]);
          const a2 = iter([1, 2]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(false);
        });
      });
      describe("iterator 2 is different than 1", () => {
        it("should return false", () => {
          // arrange
          const a1 = iter([1, 2, 3]);
          const a2 = iter([1, 2, 5]);
          // act
          const result = a1.eq(a2);
          // assert
          expect(result).toBe(false);
        });
      });
    });
  });
  describe(".inspect()", () => {
    it("should inspect", () => {
      // arrange
      const a = iter([1, 4, 2, 3]);
      const log = jest.fn();
      // act
      const sum = a
        .inspect((x) => log(`about to filter: ${x}`))
        .filter((x) => x % 2 === 0)
        .inspect((x) => log(`made it through filter: ${x}`))
        .fold(0, (sum, i) => sum + i);
      // assert
      expect(log).toHaveBeenNthCalledWith(1, "about to filter: 1");
      expect(log).toHaveBeenNthCalledWith(2, "about to filter: 4");
      expect(log).toHaveBeenNthCalledWith(3, "made it through filter: 4");
      expect(log).toHaveBeenNthCalledWith(4, "about to filter: 2");
      expect(log).toHaveBeenNthCalledWith(5, "made it through filter: 2");
      expect(log).toHaveBeenNthCalledWith(6, "about to filter: 3");
    });
  });
});
