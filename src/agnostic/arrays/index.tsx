import { findDuplicates as findDuplicatesFunc } from './find-duplicates'
import { isArrayOf as isArrayOfFunc } from './is-array-of'
import { make as makeFunc } from './make'
import {
  RANDOM_PICK_ERR_SYMBOL as R,
  randomPick as randomPickFunc
} from './random-pick'

export namespace Arrays {
  export const findDuplicates = findDuplicatesFunc
  export const isArrayOf = isArrayOfFunc
  export const make = makeFunc
  export const RANDOM_PICK_ERR_SYMBOL = R
  export const randomPick = randomPickFunc
}
