import { detectRuntime as detectRuntimeFunc } from './detect-runtime'
import { Types as TypesNamespace } from './types'
import { Window as WindowNamespace } from './window'

export namespace Crossenv {
  export const detectRuntime = detectRuntimeFunc
  export import Types = TypesNamespace
  export import Window = WindowNamespace
}
