export namespace Validation {
  // [WIP]
  // Has all keys from
  // Has extra keys from
  // Has same keys from

  // Has equal properties than (maybe option for not just shallow equivalence?)
  // Has extra properties than
  // Has same properties than

  export function fromPartial<T extends object> (obj: T, partial: Partial<T>): boolean {
    return Object.entries(partial).every(([key, val]) => {
      return obj[key as keyof Partial<T>] === val
    })
  }
}
