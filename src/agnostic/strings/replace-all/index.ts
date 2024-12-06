export function replaceAll (
  input: string,
  pattern: string | RegExp,
  replacer: string | ((substring: string, ...args: any[]) => string)): string {
  const found = Array.from(input.match(pattern) ?? [])
  const foundReplaced = typeof replacer === 'string'
    ? found.map(() => replacer)
    : found.map(e => replacer(e))
  const splitted = input.split(pattern)
  const replaced = splitted.map((chunk, chunkPos) => {
    const isLast = chunkPos === splitted.length - 1
    if (isLast) return [chunk]
    return [chunk, foundReplaced[chunkPos] ?? '']
  }).flat().join('')
  return replaced
}
