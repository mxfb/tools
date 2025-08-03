export function recordMap<Input extends Record<string, any>, Mapped> (
  record: Input,
  mapper: (value: Input[keyof Input], key: keyof Input) => Mapped
): { [K in keyof Input]: Mapped } {
  const result = {} as { [K in keyof Input]: Mapped }
  for (const key in record) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      result[key] = mapper(record[key], key)
    }
  }
  return result
}
