import path from 'node:path'
import { promises as fs, existsSync } from 'node:fs'
import { exec } from 'node:child_process'
import esbuild from 'esbuild'

const CWD = process.cwd()
const INDEX = path.join(CWD, 'src/index.ts')
const CLI = path.join(CWD, 'src/cli')
const COMPONENTS = path.join(CWD, 'src/components')
const UTILS_AGNOSTIC = path.join(CWD, 'src/utils/agnostic')
const UTILS_BROWSER = path.join(CWD, 'src/utils/browser')
const UTILS_NODE = path.join(CWD, 'src/utils/node')
const rootDirs = [CLI, COMPONENTS, UTILS_AGNOSTIC, UTILS_BROWSER, UTILS_NODE]

const entryPoints = [INDEX, ...(await Promise.all(rootDirs.map(async dir => {
  const extensions = ['.js', '.jsx', '.ts', '.tsx']
  return await listSubdirectoriesIndexes(dir, extensions)
}))).flat()]

esbuild.build({
  entryPoints,
  entryNames: '[dir]/[name]',
  chunkNames: 'chunks/[name]-[hash]',
  assetNames: 'assets/[name]-[hash]',
  outdir: 'lib',
  bundle: true,
  minify: true,
  splitting: true,
  platform: 'node',
  sourcemap: false,
  format: 'esm',
  target: ['esnext'],
  external: ['react', 'react-dom']
}).then(() => {
  console.log('Build completed')
  exec('npx tsc --jsx react-jsx -p src/tsconfig.json --emitDeclarationOnly', (err, stdout, stderr) => {
    if (err !== null) console.error(err)
    if (stdout !== '') console.log(stdout)
    if (stderr !== '') console.log(stderr)
    return
  })
}).catch(err => {
  console.error(err)
  process.exit(1)
})

async function listSubdirectoriesIndexes (root: string, extensions?: string[]): Promise<string[]> {
  if (!existsSync(root)) return []
  const rootStat = await fs.stat(root)
  const rootIsDir = rootStat.isDirectory()
  if (!rootIsDir) return []
  const rootChildren = (await fs.readdir(root)).map(name => path.join(root, name))
  const subdirectoriesIndexes = (await Promise.all(rootChildren.map(async filePath => {
    try {
      if (!existsSync(filePath)) return false
      const stat = await fs.stat(filePath)
      const isDirectory = stat.isDirectory()
      if (!isDirectory) return undefined
      const children = await fs.readdir(filePath)
      const foundIndex = children.find(childName => {
        const extension = path.extname(childName).toLowerCase()
        const baseName = path.basename(childName, extension)
        const extensionIsValid = extensions !== undefined ? extensions.includes(extension) : true
        if (baseName === 'index' && extensionIsValid) return true
        return false
      })
      if (foundIndex === undefined) return false
      return path.join(filePath, foundIndex)
    } catch (err) {
      return undefined
    }
  }))).filter((e): e is string => e !== undefined)
  return subdirectoriesIndexes
}
