export function isObject (unk: unknown): unk is object | null {
  return typeof unk === 'object'
}

export function isNonNullObject (unk: unknown): unk is object {
  return unk !== null && isObject(unk)
}
