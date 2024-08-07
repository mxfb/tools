import { CharCodes as CharCodesNamespace } from './char-codes'
import {
  matches as matchesFunc,
  matchesSome as matchesSomeFunc,
  matchesEvery as matchesEveryFunc
} from './matches'
import { replaceAll as replaceAllFunc } from './replace-all'
import { normalizeIndent as normalizeIndentFunc } from './normalize-indent'
import { toAlphanum as toAlphanumFunc } from './to-alphanum'

export namespace Strings {
  // CharCodes
  export import CharCodes = CharCodesNamespace
  // Matches
  export const matches = matchesFunc
  export const matchesSome = matchesSomeFunc
  export const matchesEvery = matchesEveryFunc
  // Normalize indent
  export const normalizeIndent = normalizeIndentFunc
  // Replace all
  export const replaceAll = replaceAllFunc
  // To alphanum
  export const toAlphanum = toAlphanumFunc
}
