import { None, Option, Some } from './Option';

describe('Option', () => {
  describe('.flatten()', () => {
    it('should flatten option', () => {
      const b = new Some(new Some(6));
      expect(b.flatten()).toEqual(new Some(6));

      const c = new Some(new None());
      expect(c.flatten()).toEqual(new None());

      const d: Option<Option<number>> = new None<Option<number>>();
      expect(d.flatten()).toEqual(new None());

      const e: Option<Option<Option<number>>> = new Some(new Some(new Some(6)));
      expect(e.flatten()).toEqual(new Some(new Some(6)));
      expect(e.flatten().flatten()).toEqual(new Some(6));
    });
  });
  describe('.isNone()', () => {
    it('should return true for None', () => {
      const none = new None();
      expect(none.isNone()).toBe(true);
    });
    it('should return false for Some', () => {
      const some = new Some(1);
      expect(some.isNone()).toBe(false);
    });
  });
  describe('.isSome()', () => {
    it('should return false for None', () => {
      const none = new None();
      expect(none.isSome()).toBe(false);
    });
    it('should return true for Some', () => {
      const some = new Some(1);
      expect(some.isSome()).toBe(true);
    });
  });
  describe('.iter()', () => {
    it('should return an iterator over the possibly contained value', () => {
      const none = new None();
      expect(none.iter().next()).toEqual({ done: false, value: new None() });

      const some = new Some(1);
      expect(some.iter().next()).toEqual({ done: false, value: new Some(1) });
    });
  });
  describe('.map()', () => {
    it('should return None if None', () => {
      const none = new None<number>();
      expect(none.map((v) => v * 2)).toEqual(new None());
    });
    it('should return Some if Some', () => {
      const some = new Some(1);
      expect(some.map((v) => v * 2)).toEqual(new Some(2));
    });
  });
  describe('.or()', () => {
    it('should return the same option (Some)', () => {
      // arrange
      const some = new Some(1);
      const other = new Some(2);
      // act
      const result = some.or(other);
      // assert
      expect(result).toBe(some);
    });
    it('should return the other option (None)', () => {
      // arrange
      const some = new None<number>();
      const other = new Some(1);
      // act
      const result = some.or(other);
      // assert
      expect(result).toBe(other);
    });
  });
  describe('.orElse()', () => {
    it('should return the same option (Some)', () => {
      // arrange
      const some = new Some(1);
      // act
      const result = some.orElse(() => new Some(2));
      // assert
      expect(result).toBe(some);
    });
    it('should return the other option (None)', () => {
      // arrange
      const some = new None<number>();
      // act
      const result = some.orElse(() => new Some(1));
      // assert
      expect(result).toBeInstanceOf(Some);
      expect(result.unwrap()).toBe(1);
    });
  });
  describe('.zip()', () => {
    it('should return None if either is None', () => {
      const none = new None<number>();
      const some = new Some(1);
      expect(none.zip(some)).toEqual(new None());
      expect(some.zip(none)).toEqual(new None());
    });
    it('should return Some if both are Some', () => {
      const some1 = new Some(1);
      const some2 = new Some(2);
      expect(some1.zip(some2)).toEqual(new Some([1, 2]));
    });
  });
  describe('.unzip()', () => {
    it('should return None if either is None', () => {
      const none = new None<[number, number]>();
      const some = new Some<[number, number]>([1, 2]);
      expect(none.unzip()).toEqual([new None(), new None()]);
      expect(some.unzip()).toEqual([new Some(1), new Some(2)]);
    });
  });
  describe('.xor()', () => {
    it('should return Some if exactly one of this, other is Some, otherwise returns None', () => {
      const none = new None<number>();
      const some = new Some(1);
      expect(none.xor(some)).toEqual(new Some(1));
      expect(some.xor(none)).toEqual(new Some(1));
      expect(some.xor(some)).toEqual(new None());
      expect(none.xor(none)).toEqual(new None());
    });
  });
  describe('Some', () => {
    describe('.and()', () => {
      it('should return the other option (Some)', () => {
        // arrange
        const some = new Some(1);
        const other = new Some(2);
        // act
        const result = some.and(other);
        // assert
        expect(result).toBe(other);
      });
      it('should return the other option (None)', () => {
        // arrange
        const some = new Some(1);
        const other = new None();
        // act
        const result = some.and(other);
        // assert
        expect(result).toBe(other);
      });
    });
    describe('.andThen()', () => {
      it('should apply fn to value', () => {
        // arrange
        const some = new Some(1);
        // act
        const result = some.andThen((v) => new Some(v * 2));
        // assert
        expect(result).toBeInstanceOf(Some);
        expect(result.unwrap()).toBe(2);
      });
    });
    describe('.expect()', () => {
      it('should return the value', () => {
        // arrange
        const some = new Some(1);
        // act
        const result = some.expect('error');
        // assert
        expect(result).toBe(1);
      });
    });
    describe('.filter()', () => {
      it('should return Some if predicate is true', () => {
        // arrange
        const some = new Some(1);
        // act
        const result = some.filter((v) => v > 0);
        // assert
        expect(result).toBe(some);
      });
      it('should return None if predicate is false', () => {
        // arrange
        const some = new Some(1);
        // act
        const result = some.filter((v) => v < 0);
        // assert
        expect(result).toBeInstanceOf(None);
      });
    });
  });
  describe('None', () => {
    describe('.and()', () => {
      it('should return None', () => {
        // arrange
        const none = new None();
        const other = new Some(2);
        // act
        const result = none.and(other);
        // assert
        expect(result).toBeInstanceOf(None);
      });
    });
    describe('.andThen()', () => {
      it('should return None', () => {
        // arrange
        const none = new None<number>();
        // act
        const result = none.andThen((v) => new Some(v * 2));
        // assert
        expect(result).toBeInstanceOf(None);
      });
    });
    describe('.expect()', () => {
      it('should throw an error', () => {
        // arrange
        const none = new None();
        // act
        const fn = () => none.expect('error');
        // assert
        expect(fn).toThrowError('error');
      });
    });
    describe('.filter()', () => {
      it('should return None', () => {
        // arrange
        const none = new None<number>();
        // act
        const result = none.filter((v) => v > 0);
        // assert
        expect(result).toBeInstanceOf(None);
      });
    });
  });
});
