import { Transformers } from '..'
import { Cast } from '../../cast'
import { Crossenv } from '../../crossenv'
import { Types } from '../../types'

export const split: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => {
    const { Text } = Crossenv.getWindow()
    const [splitter] = args
    if (typeof currentValue !== 'string'
      && !(currentValue instanceof Text)) return {
      action: 'ERROR',
      value: {
        message: 'Current value must be string or Text',
        input: currentValue
      }
    }
    if (typeof splitter !== 'string') return {
      action: 'ERROR',
      value: {
        message: 'Splitter argument must be string',
        input: splitter !== undefined ? splitter : '<undefined>'
      }
    }
    const strCurrentValue = Cast.toString(currentValue)
    const splitted = strCurrentValue
      .split(splitter)
      .map(e => typeof currentValue === 'string' ? Cast.toString(e) : Cast.toText(e))
    return {
      action: 'REPLACE',
      value: splitted
    }
  })
}
