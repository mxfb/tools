import { Elo as EloNamespace } from './elo'
import { Tennis as TennisNamespace } from './tennis'

export namespace Misc {
  // Elo
  export import Elo = EloNamespace
  // Tennis
  export import Tennis = TennisNamespace
}

