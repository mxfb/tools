import { promises as fs } from 'node:fs'
import { exec } from 'node:child_process'
import esbuild from 'esbuild'
import {
  COMPONENTS,
  UTILS_AGNOSTIC,
  UTILS_BROWSER,
  UTILS_NODE,
  LIB_INDEX
} from '../_config/index.js'
import { listSubdirectoriesIndexes } from '../_utils/index.js'

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
await fs.writeFile(
  LIB_INDEX,
  `export default {}\n`,
  { encoding: 'utf-8' }
)
