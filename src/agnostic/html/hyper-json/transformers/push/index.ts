import { Transformers } from '..'
import { Types } from '../../types'

export const push: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => {
    if (!Array.isArray(currentValue)) return {
      action: 'ERROR',
      value: {
        message: 'Current value must be an array',
        input: currentValue
      }
    }
    const outputValue = [...currentValue, ...args]
    return {
      action: 'REPLACE',
      value: outputValue
    }
  })
}
