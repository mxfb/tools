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

export const randomPickErrorSybol = Symbol()
export type RandomPickErrorSymbol = typeof randomPickErrorSybol

export default function randomPick<T> (arr: T[], exclude: T[] = []): T | RandomPickErrorSymbol {
  const filteredArr = [...arr].filter(elt => !exclude.includes(elt))
  const length = filteredArr.length
  if (length === 0) return randomPickErrorSybol
  const pos = Math.floor(Math.random() * length)
  const found = filteredArr[pos] as T
  return found
}
