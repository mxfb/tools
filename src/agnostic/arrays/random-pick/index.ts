export const RANDOM_PICK_ERR_SYMBOL = Symbol()
export function randomPick<T> (arr: T[], exclude: T[] = []): T | typeof RANDOM_PICK_ERR_SYMBOL {
  const filteredArr = [...arr].filter(elt => !exclude.includes(elt))
  const length = filteredArr.length
  if (length === 0) return RANDOM_PICK_ERR_SYMBOL
  const pos = Math.floor(Math.random() * length)
  const found = filteredArr[pos] as T
  return found
}
