import { Enums as EnumsNamespace } from './enums'
import { flattenGetters as flattenGettersFunc } from './flatten-getters'
import { isObject as isObjectFunc } from './is-object'
import { isRecord as isRecordFunc } from './is-record'
import { Validation as ValidationNamespace } from './validation'

export namespace Objects {
  // Enums
  export import Enums = EnumsNamespace
  // Flatten getters
  export const flattenGetters = flattenGettersFunc
  // Is object
  export const isObject = isObjectFunc
  // Is record
  export const isRecord = isRecordFunc
  // Validation
  export import Validation = ValidationNamespace
}
