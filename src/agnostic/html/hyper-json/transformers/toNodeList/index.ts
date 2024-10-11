import { Transformers } from '..'
import { Cast } from '../../cast'
import { Types } from '../../types'

export const toNodeList: Types.TransformerGenerator = (callerTagName): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => ({
    action: 'REPLACE',
    value: Cast.toNodeList(currentValue)
  }))
}
