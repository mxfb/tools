import { Assert as AssertNamespace } from './assert'
import { Cast as CastNamespace } from './cast'
import { Crossenv as CrossenvNamespace } from './crossenv'
import { getCurrentDownlink as getCurrentDownlinkFunc } from './get-current-downlink'
import {
  ConstructorFunction as ConstructorFunctionType,
  isConstructorFunction as isConstructorFunctionFunc
} from './is-constructor-function'
import {
  nullishValues as nullishValuesConst,
  Nullish as NullishType,
  isNullish as isNullishFunc,
  isNotNullish as isNotNullishFunc,
} from './is-nullish'
import { Logs as LogsNamespace } from './logs'
import { LoremIpsum as LoremIpsumNamespace } from './lorem-ipsum'
import { Random as RandomNamespace } from './random'

export namespace Misc {
  // Assert
  export import Assert = AssertNamespace
  // Cast
  export import Cast = CastNamespace
  // Crossenv
  export import Crossenv = CrossenvNamespace
  // Get current downlink
  export const getCurrentDownlink = getCurrentDownlinkFunc
  // Is constructor function
  export type ConstructorFunction = ConstructorFunctionType
  export const isConstructorFunction = isConstructorFunctionFunc
  // Is nullish
  export const nullishValues = nullishValuesConst
  export type Nullish = NullishType
  export const isNullish = isNullishFunc
  export const isNotNullish = isNotNullishFunc
  // Logs
  export import Logs = LogsNamespace
  // LoremIpsum
  export import LoremIpsum = LoremIpsumNamespace
  // Random
  export import Random = RandomNamespace
}

