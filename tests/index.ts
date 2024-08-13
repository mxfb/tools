import process from 'node:process'
import path from 'node:path'
import { Tennis } from '../lib/agnostic/misc/tennis/index.js'

const match = new Tennis.Score.Match({
  upTo: 1,
  setsFormat: {
    upTo: 6,
    diffToWin: 2,
    gamesFormat: {
      upTo: 4,
      diffToWin: 2
    },
    tieBreakAt: null,
    tieBreakFormat: {
      upTo: 7,
      diffToWin: 2
    }
  },
  lastSetFormat: {
    upTo: 6,
    diffToWin: 2,
    gamesFormat: {
      upTo: 4,
      diffToWin: 2
    },
    tieBreakAt: null,
    tieBreakFormat: {
      upTo: 7,
      diffToWin: 2
    }
  }
})

let ops = 0
let aWinStreak = 0
let bWinStreak = 0
while (true) {
  console.log(match.isFinished(), match.getScore())
  if (ops ++ >= 1000) break;
  if (match.isFinished()) break;
  const rand = Math.random()
  let aWins: boolean
  if (aWinStreak >= 2) {
    aWinStreak = 0
    bWinStreak = 1
    aWins = false
  } else if (bWinStreak >= 2) {
    bWinStreak = 0
    aWinStreak = 1
    aWins = true
  } else {
    aWins = rand > .75
    if (aWins) {
      bWinStreak = 0
      aWinStreak ++
    } else {
      aWinStreak = 0
      bWinStreak ++
    }
  }
  if (aWins) { match.add(true) }
  else { match.add(false) }
}
console.log('Points played:', ops)






// import listSubpaths from '../lib/utils/node/list-subpaths'
// import * as rand from '../lib/utils/agnostic/random'

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
