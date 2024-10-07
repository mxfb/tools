import { isArrayOf as isArrayOfFunc } from './is-array-of'

export namespace Arrays {
  type Filler<T = any> = (pos?: number) => T

  export function make<T> (filler: Filler<T>, length: number) {
    return new Array(length)
      .fill(null)
      .map((_, pos) => filler(pos))
  }

  export function findDuplicates<T> (arr: T[], stopAtFirst: boolean = false): T[] {
    const seen = new Set<T>()
    const duplicates = new Set<T>()
    for (const item of arr) {
      if (seen.has(item) && stopAtFirst) return [item]
      if (seen.has(item)) duplicates.add(item)
      seen.add(item)
    }
    return Array.from(duplicates)
  }

  // [WIP] not sure about this symbol thing
  // [WIP] should use shared/errors
  export const ERR_SYMBOL = Symbol()

  export function randomPick<T> (arr: T[], exclude: T[] = []): T | typeof ERR_SYMBOL {
    const filteredArr = [...arr].filter(elt => !exclude.includes(elt))
    const length = filteredArr.length
    if (length === 0) return ERR_SYMBOL
    const pos = Math.floor(Math.random() * length)
    const found = filteredArr[pos] as T
    return found
  }

  export const isArrayOf = isArrayOfFunc
}
