import { AsyncIter } from './AsyncIter';

describe('AsyncIter', () => {
  describe('.map()', () => {
    it('should map', async () => {
      const iter = AsyncIter.from([1, Promise.resolve(2), 3]);
      const mapped = iter
        .map((item) => Promise.resolve(item * 2))
        .map((item) => Promise.resolve(item + 1));
      await expect(mapped.next()).resolves.toEqual({ done: false, value: 3 });
      await expect(mapped.next()).resolves.toEqual({ done: false, value: 5 });
      await expect(mapped.next()).resolves.toEqual({ done: false, value: 7 });
      await expect(mapped.next()).resolves.toEqual({
        done: true,
        value: undefined,
      });
    });
  });
});
