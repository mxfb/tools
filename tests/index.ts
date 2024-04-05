import process from 'node:process'
import path from 'node:path'
import listSubpaths from '../lib/utils/node/list-subpaths/index.js'

/* * * * * * * * * * * * * * * *
 * List subpaths
 * * * * * * * * * * * * * * * */

console.time('listSubpaths')
const subpaths = await listSubpaths(process.cwd(), {
  directories: false,
  symlinks: false,
  files: true,
  hidden: false,
  filter: filePath => {
    if (filePath.includes('node_modules/')) return false
    return path.basename(filePath).match(/^index\.(js)$/) !== null
  }
})
console.timeEnd('listSubpaths')

console.log(subpaths)
