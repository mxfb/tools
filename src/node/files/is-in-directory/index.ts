import path from 'node:path'

export function isInDirectory (childPath: string, parentPath: string) {
  const rel = path.relative(parentPath, childPath)
  return rel !== '' && !rel.startsWith('..')
}
