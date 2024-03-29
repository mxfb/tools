import path from 'node:path'

export default function isInDirectory (childPath: string, parentPath: string) {
  const rel = path.relative(parentPath, childPath)
  return rel !== '' && !rel.startsWith('..')
}
