import { Crossenv as CrossenvNamespace } from './crossenv'
import { Cast as CastNamespace } from './cast'
import { Serialize as SerializeNamespace } from './serialize'
import { Transformers as TransformersNamespace } from './transformers'
import { Tree as TreeClass } from './tree'
import { Types as TypesNamespace } from './types'

export namespace HyperJson {
  export import Crossenv = CrossenvNamespace
  export import Cast = CastNamespace
  export import Serialize = SerializeNamespace
  export import Transformers = TransformersNamespace
  export const Tree = TreeClass  
  export import Types = TypesNamespace
}
