import { None, Option, Some } from './Option';
import { Err, Ok, Result } from './Result';

describe('Result', () => {
  describe('.match()', () => {
    it('should match', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(
        ok.match(
          (v) => v.toString(),
          (e) => e.message,
        ),
      ).toEqual('1');
      const err: Result<number, Error> = Err(new Error('error'));
      expect(
        err.match(
          (v) => v.toString(),
          (e) => e.message,
        ),
      ).toEqual('error');
    });
  });
  describe('.andThen()', () => {
    it('should andThen', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.andThen((v) => Ok(v.toString()))).toStrictEqual(Ok('1'));
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.andThen((v) => Ok(v.toString()))).toStrictEqual(
        Err(new Error('error')),
      );
    });
  });
  describe('.and()', () => {
    it('should and', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.and(Ok('1'))).toStrictEqual(Ok('1'));
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.and(Ok('1'))).toStrictEqual(Err(new Error('error')));
    });
  });
  describe('.err()', () => {
    it('should return option of Err', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.err()).toStrictEqual(None());
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.err()).toStrictEqual(Some(new Error('error')));
    });
  });
  describe('.expect()', () => {
    it('should return value of Ok', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.expect('error')).toEqual(1);
    });
    it('should throw error of Err', () => {
      const err: Result<number, Error> = Err(new Error('error'));
      expect(() => err.expect('error')).toThrowError('error');
    });
  });
  describe('.expectErr()', () => {
    it('should return error of Err', () => {
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.expectErr('error')).toEqual(new Error('error'));
    });
    it('should throw error of Ok', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(() => ok.expectErr('error')).toThrowError('error');
    });
  });
  describe('.isErr()', () => {
    it('should return true if Err', () => {
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.isErr()).toEqual(true);
    });
    it('should return false if Ok', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.isErr()).toEqual(false);
    });
  });
  describe('.isOk()', () => {
    it('should return true if Ok', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.isOk()).toEqual(true);
    });
    it('should return false if Err', () => {
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.isOk()).toEqual(false);
    });
  });
  describe('.iter()', () => {
    it('should iterate', () => {
      const ok: Result<number, Error> = Ok(1);
      expect([...ok.iter()]).toEqual([1]);
      const err: Result<number, Error> = Err(new Error('error'));
      expect([...err.iter()]).toEqual([]);
    });
  });
  describe('.map()', () => {
    it('should map', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.map((v) => v.toString())).toStrictEqual(Ok('1'));
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.map((v) => v.toString())).toStrictEqual(
        Err(new Error('error')),
      );
    });
  });
  describe('.mapErr()', () => {
    it('should mapErr', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.mapErr((e) => new Error(e.message))).toStrictEqual(Ok(1));
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.mapErr(() => new Error('mapped'))).toStrictEqual(
        Err(new Error('mapped')),
      );
    });
  });
  describe('.mapOr()', () => {
    it('should mapOr', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.mapOr(0, (v) => v + 1)).toEqual(2);
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.mapOr(0, (v) => v + 1)).toEqual(0);
    });
  });
  describe('.mapOrElse()', () => {
    it('should mapOrElse', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(
        ok.mapOrElse(
          () => 0,
          (v) => v + 1,
        ),
      ).toEqual(2);
      const err: Result<number, Error> = Err(new Error('error'));
      expect(
        err.mapOrElse(
          () => 0,
          (v) => v + 1,
        ),
      ).toEqual(0);
    });
  });
  describe('.ok()', () => {
    it('should return option of Ok', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.ok()).toStrictEqual(Some(1));
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.ok()).toStrictEqual(None());
    });
  });
  describe('.or()', () => {
    it('should or', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.or(Ok(2))).toStrictEqual(Ok(1));
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.or(Ok(2))).toStrictEqual(Ok(2));
    });
  });
  describe('.orElse()', () => {
    it('should orElse', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.orElse(() => Ok(2))).toStrictEqual(Ok(1));
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.orElse(() => Ok(2))).toStrictEqual(Ok(2));
    });
  });
  describe('.transpose()', () => {
    it('should transpose', () => {
      const ok: Result<Option<number>, Error> = Ok(Some(1));
      expect(ok.transpose()).toStrictEqual(Some(Ok(1)));
      const err: Result<Option<number>, Error> = Err(new Error('error'));
      expect(err.transpose()).toStrictEqual(Some(Err(new Error('error'))));
      const okNone: Result<Option<number>, Error> = Ok(None());
      expect(okNone.transpose()).toStrictEqual(None());
    });
  });
  describe('.unwrap()', () => {
    it('should unwrap Ok', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.unwrap()).toEqual(1);
    });
    it('should throw error of Err', () => {
      const err: Result<number, Error> = Err(new Error('error'));
      expect(() => err.unwrap()).toThrowError();
    });
  });
  describe('.unwrapErr()', () => {
    it('should unwrapErr Err', () => {
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.unwrapErr()).toEqual(new Error('error'));
    });
    it('should throw error of Ok', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(() => ok.unwrapErr()).toThrowError();
    });
  });
  describe('.unwrapOrElse()', () => {
    it('should unwrapOrElse Ok', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.unwrapOrElse(() => 0)).toEqual(1);
    });
    it('should unwrapOrElse Err', () => {
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.unwrapOrElse(() => 0)).toEqual(0);
    });
  });
  describe('.unwrapOr()', () => {
    it('should unwrapOr Ok', () => {
      const ok: Result<number, Error> = Ok(1);
      expect(ok.unwrapOr(0)).toEqual(1);
    });
    it('should unwrapOr Err', () => {
      const err: Result<number, Error> = Err(new Error('error'));
      expect(err.unwrapOr(0)).toEqual(0);
    });
  });
});
