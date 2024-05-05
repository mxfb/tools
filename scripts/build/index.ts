import process from 'node:process'
import { promises as fs } from 'node:fs'
import { exec } from 'node:child_process'
import path from 'node:path'
import esbuild from 'esbuild'
import camelCase from 'camelcase'
import {
  COMPONENTS,
  UTILS_AGNOSTIC,
  UTILS_BROWSER,
  UTILS_NODE,
  LIB,
  LIB_INDEX
} from '../_config/index.js'
import {
  findFirstDuplicate,
  isInDirectory,
  listSubdirectoriesIndexes
} from '../_utils/index.js'

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Build
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const rootDirs = [COMPONENTS, UTILS_AGNOSTIC, UTILS_BROWSER, UTILS_NODE]
const entryPoints = (await Promise.all(rootDirs.map(async dir => {
  const extensions = ['.js', '.jsx', '.ts', '.tsx']
  return await listSubdirectoriesIndexes(dir, extensions)
}))).flat()

await new Promise((resolve, reject) => {
  esbuild.build({
    entryPoints,
    entryNames: '[dir]/[name]',
    chunkNames: 'chunks/[name]-[hash]',
    assetNames: 'assets/[name]-[hash]',
    outdir: LIB,
    bundle: true,
    minify: true,
    splitting: true,
    platform: 'node',
    sourcemap: false,
    format: 'esm',
    target: ['esnext'],
    external: [
      'chalk',
      'fs-extra',
      'get-image-colors',
      'jsdom',
      'node-fetch',
      'react',
      'react-dom',
      'sharp'
    ]
  }).then(() => {
    console.log('Build completed')
    resolve(true)
  }).catch(err => {
    console.error(err)
    reject(err)
    process.exit(1)
  })
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Create type declarations
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

await new Promise(resolve => {
  exec('npx tsc --jsx react-jsx -p src/tsconfig.json --emitDeclarationOnly', (err, stdout, stderr) => {
    if (err !== null) console.error(err)
    if (stdout !== '') console.log(stdout)
    if (stderr !== '') console.log(stderr)
    resolve(true)
  })
})

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
 *
 * Create index.js
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * */

const libIndexImportsNames: string[] = []
const libIndexImports: string[] = []
const libIndexExports: string[] = []
entryPoints.forEach(indexPath => {
  const isComp = isInDirectory(indexPath, COMPONENTS)
  const isAgnosticUtil = isInDirectory(indexPath, UTILS_AGNOSTIC)
  const isBrowserUtil = isInDirectory(indexPath, UTILS_BROWSER)
  const isNodeUtil = isInDirectory(indexPath, UTILS_NODE)
  let srcSubFolder
  if (isComp) { srcSubFolder = './components' }
  else if (isAgnosticUtil) { srcSubFolder = './utils/agnostic' }
  else if (isBrowserUtil) { srcSubFolder = './utils/browser' }
  else if (isNodeUtil) { srcSubFolder = './utils/node' }
  const parentDir = path.basename(path.dirname(indexPath))
  const parentDirFormatted = camelCase(parentDir, { pascalCase: isComp })
  libIndexImportsNames.push(parentDirFormatted)
  libIndexImports.push(`import * as ${parentDirFormatted} from '${srcSubFolder}/${parentDir}/index.js'`)
  libIndexExports.push(`export { ${parentDirFormatted} }`)
})

const libIndexExportsDuplicate = findFirstDuplicate(libIndexImportsNames)
if (libIndexExportsDuplicate !== null) {
  console.error(`Duplicate export name in lib: ${libIndexExportsDuplicate}`)
  process.exit(1)
}
const libIndexContent = `${libIndexImports.join('\n')}\n${libIndexExports.join('\n')}\n`

await fs.writeFile(LIB_INDEX, libIndexContent, { encoding: 'utf-8' })
