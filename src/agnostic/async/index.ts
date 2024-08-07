import { timeoutCall as timeoutCallFunc } from './timeout-call'
import { Transitions as TransitionsNamespace } from './transitions'
import { wait as waitFunc } from './wait'

export namespace Async {
  export const timeoutCall = timeoutCallFunc
  export import Transitions = TransitionsNamespace
  export const wait = waitFunc
}
