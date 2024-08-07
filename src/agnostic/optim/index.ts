import { memoize as memoizeFunc } from './memoize'
import {
  throttle as throttleFunc,
  debounce as debounceFunc
} from './throttle-debounce'

export namespace Optim {
  // Memoize
  export const memoize = memoizeFunc
  // Throttle-debounce
  export const throttle = throttleFunc
  export const debounce = debounceFunc
}