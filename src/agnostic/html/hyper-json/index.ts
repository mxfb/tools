import { Cast as CastNamespace } from './cast'
import { Method as MethodClass } from './method'
import { Serialize as SerializeNamespace } from './serialize'
import { SmartTags as SmartTagsNamespace } from './smart-tags'
import { Transformer as TransformerClass } from './transformer'
import { Tree as TreeNamespace } from './tree'
import { Types as TypesNamespace } from './types'
import { Utils as UtilsNamespace } from './utils'

export namespace HyperJson {
  export import Cast = CastNamespace
  export const Method = MethodClass
  export import Serialize = SerializeNamespace
  export import SmartTags = SmartTagsNamespace
  export const Transformer = TransformerClass
  export import Tree = TreeNamespace
  export import Types = TypesNamespace
  export import Utils = UtilsNamespace
}
