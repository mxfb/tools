import { Utils } from '../../utils'
import { Types } from '../../types'

export const toNull: Types.TransformerGenerator = (callerTagName): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, currentValue => ({
    action: 'REPLACE',
    value: null
  }))
}
