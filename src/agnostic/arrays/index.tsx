import { findDuplicates as findDuplicatesFunc } from './find-duplicates'
import { isArrayOf as isArrayOfFunc } from './is-array-of'
import { make as makeFunc } from './make'
import {
  randomPick as randomPickFunc,
  randomPickMany as randomPickManyFunc
} from './random-pick'
import { shuffle as shuffleFunc } from './shuffle'


export namespace Arrays {
  export const findDuplicates = findDuplicatesFunc
  export const isArrayOf = isArrayOfFunc
  export const make = makeFunc
  export const randomPick = randomPickFunc
  export const randomPickMany = randomPickManyFunc
  export const shuffle = shuffleFunc
}
