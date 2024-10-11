import { Transformers } from '..'
import { Cast } from '../../cast'
import { Types } from '../../types'

export const toBoolean: Types.TransformerGenerator = (callerTagName): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => ({
    action: 'REPLACE',
    value: Cast.toBoolean(currentValue)
  }))
}
