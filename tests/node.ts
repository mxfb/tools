// import process from 'node:process'
// import path from 'node:path'
// import fetch from 'node-fetch'
// import { WebCrawler } from '../lib/agnostic/misc/web-crawler/index.js'
// import { Logs } from '../lib/agnostic/misc/logs/index.js'
import { HyperJson } from '~/agnostic/html/hyper-json'
import { Logs } from '~/agnostic/misc/logs/index.js'
import { JSDOM } from 'jsdom'
// import listSubpaths from '../lib/utils/node/list-subpaths'
// import * as rand from '../lib/utils/agnostic/random'
// import { LoremIpsum } from '../lib/agnostic/misc/lorem-ipsum/index.js'
// import { HyperJson } from '../lib/agnostic/html/hyper-json/index.js'

console.log(Logs.styles.title('Node tests.'))
const doc = new JSDOM('<doctype html><html><head></head><body></body></html>').window.document
const elt = doc.createElement('div')
console.log(new HyperJson.Tree(elt))
console.log('done.')
process.exit(0)

/* * * * * * * * * * * * * * * *
 * Lorem Ipsum
 * * * * * * * * * * * * * * * */

// console.log(LoremIpsum.generateSentences(10, 4, 6))


/* * * * * * * * * * * * * * * *
 * Hyper Json
 * * * * * * * * * * * * * * * */
// new HyperJson.Tree({} as Element)








/* * * * * * * * * * * * * * * *
 * Crawler
 * * * * * * * * * * * * * * * */
// const crawler = WebCrawler.create({
//   limit: 100,
//   delayMs: () => 600 + Math.random() * 800,
//   fetcher: async url => {
//     const res = await fetch(url)
//     return await res.text() as string | null
//   },
//   processor: (url, content, { push, flush }) => {
//     console.log(Logs.styles.important(url))
//     console.log('\n=====\n')
//     console.log(content)
//     console.log('\n=====\n')
//     const links = (content ?? '').match(/http(s)?:\/\/\S+/igm)
//     console.log('links')
//     console.log(links)
//     console.log('\n=====\n')
//     push(...Array.from(links ?? []))
//   }
// })

// crawler.crawl('https://fr.wikipedia.org/wiki/Sleaford_Mods')










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
