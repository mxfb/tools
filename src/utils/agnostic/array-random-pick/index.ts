export const errorSybol = Symbol()
export type ErrorSymbol = typeof errorSybol

export default function arrayRandomPick<T> (arr: T[], exclude: T[] = []): T | ErrorSymbol {
  const filteredArr = [...arr].filter(elt => !exclude.includes(elt))
  const length = filteredArr.length
  if (length === 0) return errorSybol
  const pos = Math.floor(Math.random() * length)
  const found = filteredArr[pos] as T
  return found
}
