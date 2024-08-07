import { Assert as AssertNamespace } from './assert'
import { Cast as CastNamespace } from './cast'
import { Crossenv as CrossenvNamespace } from './crossenv'
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
import { Random as RandomNamespace } from './random'

export namespace Misc {
  export import Assert = AssertNamespace
  export import Cast = CastNamespace
  export import Crossenv = CrossenvNamespace

  export type ConstructorFunction = ConstructorFunctionType
  export const isConstructorFunction = isConstructorFunctionFunc

  export const nullishValues = nullishValuesConst
  export type Nullish = NullishType
  export const isNullish = isNullishFunc
  export const isNotNullish = isNotNullishFunc

  export import Logs = LogsNamespace
  export import Random = RandomNamespace
}

