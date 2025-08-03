import { Arrays as ArraysNamespace } from './arrays'
import { Booleans as BooleansNamespace } from './booleans'
import { Css as CssNamespace } from './css'
import { Errors as ErrorsNamespace } from './errors'
import { Html as HtmlNamespace } from './html'
import * as MiscNamespace from './misc'
import { Numbers as NumbersNamespace } from './numbers'
import { Objects as ObjectsNamespace } from './objects'
import { Optim as OptimNamespace } from './optim'
import { Regexps as RegexpsNamespace } from './regexps'
import { Strings as StringsNamespace } from './strings'
import { Colors as ColorsNamespace } from './colors'

export namespace Agnostic {
  export import Arrays = ArraysNamespace
  export import Booleans = BooleansNamespace
  export import Css = CssNamespace
  export import Errors = ErrorsNamespace
  export import Html = HtmlNamespace
  export import Misc = MiscNamespace
  export import Numbers = NumbersNamespace
  export import Objects = ObjectsNamespace
  export import Optim = OptimNamespace
  export import Regexps = RegexpsNamespace
  export import Strings = StringsNamespace
  export import Colors = ColorsNamespace
}
