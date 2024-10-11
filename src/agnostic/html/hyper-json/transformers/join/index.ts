import { Transformers } from '..'
import { Cast } from '../../cast'
import { Types } from '../../types'

export const join: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => {
    const joiner = Cast.toString(args.at(0) ?? ',')
    if (!Array.isArray(currentValue)) return {
      action: 'ERROR',
      value: {
        message: `Current value must be an array`,
        input: currentValue
      }
    }
    return {
      action: 'REPLACE',
      value: currentValue.join(joiner)
    }
  })
}
