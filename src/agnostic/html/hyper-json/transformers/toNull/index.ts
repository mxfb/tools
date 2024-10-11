import { Transformers } from '..'
import { Types } from '../../types'

export const toNull: Types.TransformerGenerator = (callerTagName): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => ({
    action: 'REPLACE',
    value: null
  }))
}
