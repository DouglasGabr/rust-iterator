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
});
