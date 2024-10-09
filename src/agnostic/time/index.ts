import { Duration as DurationNamespace } from './duration'
import { timeout as timeoutFunc } from './timeout'
import { Transitions as TransitionsNamespace } from './transitions'
import { wait as waitFunc } from './wait'

export namespace Time {
  export import Duration = DurationNamespace
  export const timeout = timeoutFunc
  export import Transitions = TransitionsNamespace
  export const wait = waitFunc
}
