import { None, Option, Some } from './Option';

describe('Option', () => {
  describe('.flatten()', () => {
    it('should flatten option', () => {
      const b = Some(Some(6));
      expect(b.flatten()).toEqual(Some(6));

      const c = Some(None);
      expect(c.flatten()).toEqual(None);

      const d: Option<Option<number>> = None;
      expect(d.flatten()).toEqual(None);

      const e: Option<Option<Option<number>>> = Some(Some(Some(6)));
      expect(e.flatten()).toEqual(Some(Some(6)));
      expect(e.flatten().flatten()).toEqual(Some(6));
    });
  });
  describe('.isNone()', () => {
    it('should return true for None', () => {
      const none = None;
      expect(none.isNone()).toBe(true);
    });
    it('should return false for Some', () => {
      const some = Some(1);
      expect(some.isNone()).toBe(false);
    });
  });
  describe('.isSome()', () => {
    it('should return false for None', () => {
      const none = None;
      expect(none.isSome()).toBe(false);
    });
    it('should return true for Some', () => {
      const some = Some(1);
      expect(some.isSome()).toBe(true);
    });
  });
  describe('.iter()', () => {
    it('should return an iterator over the possibly contained value', () => {
      const none = None;
      expect(none.iter().next()).toEqual({ done: false, value: None });

      const some = Some(1);
      expect(some.iter().next()).toEqual({ done: false, value: Some(1) });
    });
  });
  describe('.map()', () => {
    it('should return None if None', () => {
      const none: Option<number> = None;
      expect(none.map((v) => v * 2)).toEqual(None);
    });
    it('should return Some if Some', () => {
      const some = Some(1);
      expect(some.map((v) => v * 2)).toEqual(Some(2));
    });
  });
  describe('.or()', () => {
    it('should return the same option (Some)', () => {
      // arrange
      const some = Some(1);
      const other = Some(2);
      // act
      const result = some.or(other);
      // assert
      expect(result).toBe(some);
    });
    it('should return the other option (None)', () => {
      // arrange
      const some: Option<number> = None;
      const other = Some(1);
      // act
      const result = some.or(other);
      // assert
      expect(result).toBe(other);
    });
  });
  describe('.orElse()', () => {
    it('should return the same option (Some)', () => {
      // arrange
      const some = Some(1);
      // act
      const result = some.orElse(() => Some(2));
      // assert
      expect(result).toBe(some);
    });
    it('should return the other option (None)', () => {
      // arrange
      const some: Option<number> = None;
      // act
      const result = some.orElse(() => Some(1));
      // assert
      expect(result.isSome()).toBeTruthy();
      expect(result.unwrap()).toBe(1);
    });
  });
  describe('.zip()', () => {
    it('should return None if either is None', () => {
      const none: Option<number> = None;
      const some = Some(1);
      expect(none.zip(some)).toEqual(None);
      expect(some.zip(none)).toEqual(None);
    });
    it('should return Some if both are Some', () => {
      const some1 = Some(1);
      const some2 = Some(2);
      expect(some1.zip(some2)).toEqual(Some([1, 2]));
    });
  });
  describe('.unzip()', () => {
    it('should return None if either is None', () => {
      const none: Option<[number, number]> = None;
      const some = Some<[number, number]>([1, 2]);
      expect(none.unzip()).toEqual([None, None]);
      expect(some.unzip()).toEqual([Some(1), Some(2)]);
    });
  });
  describe('.xor()', () => {
    it('should return Some if exactly one of this, other is Some, otherwise returns None', () => {
      const none: Option<number> = None;
      const some = Some(1);
      expect(none.xor(some)).toEqual(Some(1));
      expect(some.xor(none)).toEqual(Some(1));
      expect(some.xor(some)).toEqual(None);
      expect(none.xor(none)).toEqual(None);
    });
  });
  describe('Some', () => {
    describe('.and()', () => {
      it('should return the other option (Some)', () => {
        // arrange
        const some = Some(1);
        const other = Some(2);
        // act
        const result = some.and(other);
        // assert
        expect(result).toBe(other);
      });
      it('should return the other option (None)', () => {
        // arrange
        const some = Some(1);
        const other = None;
        // act
        const result = some.and(other);
        // assert
        expect(result).toBe(other);
      });
    });
    describe('.andThen()', () => {
      it('should apply fn to value', () => {
        // arrange
        const some = Some(1);
        // act
        const result = some.andThen((v) => Some(v * 2));
        // assert
        expect(result.isSome()).toBeTruthy();
        expect(result.unwrap()).toBe(2);
      });
    });
    describe('.expect()', () => {
      it('should return the value', () => {
        // arrange
        const some = Some(1);
        // act
        const result = some.expect('error');
        // assert
        expect(result).toBe(1);
      });
    });
    describe('.filter()', () => {
      it('should return Some if predicate is true', () => {
        // arrange
        const some = Some(1);
        // act
        const result = some.filter((v) => v > 0);
        // assert
        expect(result).toBe(some);
      });
      it('should return None if predicate is false', () => {
        // arrange
        const some = Some(1);
        // act
        const result = some.filter((v) => v < 0);
        // assert
        expect(result.isNone()).toBeTruthy();
      });
    });
  });
  describe('None', () => {
    describe('.and()', () => {
      it('should return None', () => {
        // arrange
        const none = None;
        const other = Some(2);
        // act
        const result = none.and(other);
        // assert
        expect(result.isNone()).toBeTruthy();
      });
    });
    describe('.andThen()', () => {
      it('should return None', () => {
        // arrange
        const none: Option<number> = None;
        // act
        const result = none.andThen((v) => Some(v * 2));
        // assert
        expect(result.isNone()).toBeTruthy();
      });
    });
    describe('.expect()', () => {
      it('should throw an error', () => {
        // arrange
        const none = None;
        // act
        const fn = () => none.expect('error');
        // assert
        expect(fn).toThrowError('error');
      });
    });
    describe('.filter()', () => {
      it('should return None', () => {
        // arrange
        const none: Option<number> = None;
        // act
        const result = none.filter((v) => v > 0);
        // assert
        expect(result.isNone()).toBeTruthy();
      });
    });
  });
});
