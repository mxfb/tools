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

// [WIP] dedupe ?
