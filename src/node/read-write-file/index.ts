import { promises as fs } from 'node:fs'

type Path = Parameters<typeof fs.writeFile>[0]
type ReadFileData = Awaited<ReturnType<typeof fs.readFile>>
type WriteFileData = Parameters<typeof fs.writeFile>[1]
type ReadOptions = Parameters<typeof fs.readFile>[1]
type WriteOptions = Parameters<typeof fs.writeFile>[2]

export type EditorFunc = (curr: ReadFileData) => WriteFileData

export default async function readWriteFile (
  path: Path,
  editor: EditorFunc,
  ...options: [ReadOptions?, WriteOptions?]) {
  const [readOptions, writeOptions] = options
  const read = await fs.readFile(path, readOptions)
  const edited = editor(read)
  const actualWriteOptions = options.length === 2 ? writeOptions : readOptions
  await fs.writeFile(path, edited, actualWriteOptions)
  return edited
}
