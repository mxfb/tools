import { Outcome } from '../../../../../misc/outcome'
import { Types } from '../../../types'
import { Cast } from '../../../cast'
import { Utils } from '../../../utils'
import { SmartTags } from '../..'

type Main = Types.Tree.RestingValue
type Args = Array<string | Text>
type Output = Element

export const toelement = SmartTags.makeSmartTag<Main, Args, Output>({
  name: 'toelement',
  defaultMode: 'coalescion',
  isolationInitType: 'array',
  mainValueCheck: m => Outcome.makeSuccess(m),
  argsValueCheck: a => Utils.Tree.TypeChecks.typeCheckManyWithLength(a, 0, 1, 'string', 'text'),
  func: (m, a) => {
    const [rawTagName] = a
    const castedTagName = rawTagName !== undefined
      ? Cast.toString(rawTagName)
      : undefined
    const tagName = castedTagName !== '' ? castedTagName : undefined
    return Outcome.makeSuccess(Cast.toElement(m, tagName?.trim().toLowerCase()))
  }
})
