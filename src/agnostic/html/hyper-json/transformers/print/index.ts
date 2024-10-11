import { Transformers } from '..'
import { Types } from '../../types'

export const print: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => {
    if (args.length === 0) console.log(currentValue)
    else console.log(...args)
    return { action: null }
  })
}
