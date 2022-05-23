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
});
