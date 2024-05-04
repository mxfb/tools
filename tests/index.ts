import process from 'node:process'
import path from 'node:path'
import listSubpaths from '../lib/utils/node/list-subpaths/index.js'
import * as rand from '../lib/utils/agnostic/random/index.js'
import wait from '../lib/utils/agnostic/wait/index.js'
import {
  Config,
  createConfigFile,
  deleteConfigDir,
  deleteConfigFile,
  ensureConfigFile,
  getConfigFile,
  validateConfigObj,
  parseConfigFile,
  getConfig,
  updateConfig
} from '../lib/utils/node/mxfb-cli-config/index.js'

await deleteConfigDir('THIS IS A DESTRUCTIVE AND DEFINITIVE ACTION')
const firstConfig = await getConfig()
console.log('firstConfig', firstConfig)
console.log('Wait for 2s...')
await wait(2000)
const config = await getConfig(true)
console.log('config', config)
console.log('Wait for 2s...')
await wait(2000)
const updated = await updateConfig(curr => ({
  ...curr,
  mxfb_projects_sync: {
    lm_path: 'cc',
    mxfb_path: 'sss'
  }
}))
console.log('updated', updated)
console.log('Wait for 2s...')
await wait(2000)
const deleted = await deleteConfigDir('THIS IS A DESTRUCTIVE AND DEFINITIVE ACTION')
console.log('deleted', deleted)
console.log('Bye.')


/* * * * * * * * * * * * * * * *
 * Random
 * * * * * * * * * * * * * * * */
// console.log(rand.random(5))
// console.log(rand.random(5, 10))
// console.log(rand.random(10, 5))

// console.log(rand.randomHashPattern([2, 3, 1, 2], ';'))

/* * * * * * * * * * * * * * * *
 * List subpaths
 * * * * * * * * * * * * * * * */

// console.time('listSubpaths')
// const subpaths = await listSubpaths(process.cwd(), {
//   directories: false,
//   symlinks: false,
//   files: true,
//   hidden: false,
//   filter: filePath => {
//     if (filePath.includes('node_modules/')) return false
//     return path.basename(filePath).match(/^index\.(js)$/) !== null
//   }
// })
// console.timeEnd('listSubpaths')

// console.log(subpaths)
