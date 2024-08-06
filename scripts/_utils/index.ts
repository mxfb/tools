import { promises as fs, existsSync } from 'node:fs'
import path from 'node:path'

export function isInDirectory (childPath: string, parentPath: string) {
  const rel = path.relative(parentPath, childPath)
  return rel !== '' && !rel.startsWith('..')
}

export function findFirstDuplicate<T> (arr: T[]) {
  const seen = new Set<T>()
  for (const item of arr) {
    if (seen.has(item)) return item
    seen.add(item)
  }
  return null
}
