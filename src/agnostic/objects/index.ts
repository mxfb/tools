import { deepGetProperty as deepGetPropertyFunc } from './deep-get-property'
import { Enums as EnumsNamespace } from './enums'
import { flattenGetters as flattenGettersFunc } from './flatten-getters'
import {
  isObject as isObjectFunc,
  isNonNullObject as isNonNullObjectFunc
} from './is-object'
import { isRecord as isRecordFunc } from './is-record'
import { recordFormat as recordFormatFunc } from './record-format'
import { recordMap as recordMapFunc } from './record-map'
import { Validation as ValidationNamespace } from './validation'

export namespace Objects {
  // Deep get property
  export const deepGetProperty = deepGetPropertyFunc
  // Enums
  export import Enums = EnumsNamespace
  // Flatten getters
  export const flattenGetters = flattenGettersFunc
  // Is object
  export const isObject = isObjectFunc
  export const isNonNullObject = isNonNullObjectFunc
  // Is record
  export const isRecord = isRecordFunc
  // Record format
  export const recordFormat = recordFormatFunc
  // Record map
  export const recordMap = recordMapFunc
  // Validation
  export import Validation = ValidationNamespace
}
