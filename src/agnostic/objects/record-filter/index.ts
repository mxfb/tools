export function recordFilter<T extends Record<string, any>>(
  record: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  for (const key in record) {
    if (
      Object.prototype.hasOwnProperty.call(record, key) &&
      predicate(record[key], key)
    ) {
      result[key] = record[key];
    }
  }
  return result;
}
