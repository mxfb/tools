import { Utils } from '../../utils'
import { Cast } from '../../cast'
import { Types } from '../../types'

export const toString: Types.TransformerGenerator = (callerTagName): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, currentValue => ({
    action: 'REPLACE',
    value: Cast.toString(currentValue)
  }))
}
