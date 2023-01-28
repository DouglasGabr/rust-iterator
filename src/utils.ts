export enum Ordering {
  Less = -1,
  Equal = 0,
  Greater = 1,
}

export function cmp<T>(a: T, b: T): Ordering {
  if (a === b) return Ordering.Equal;
  if (a < b) return Ordering.Less;
  return Ordering.Greater;
}
