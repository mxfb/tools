import { Transformers } from '..'
import { Crossenv } from '../../crossenv'
import { Types } from '../../types'

export const length: Types.TransformerGenerator = (callerTagName): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => {
    const { Element, NodeList, Text } = Crossenv.getWindow()
    if (typeof currentValue === 'string'
      || Array.isArray(currentValue)
      || currentValue instanceof NodeList) return {
      action: 'REPLACE',
      value: currentValue.length
    }
    if (currentValue instanceof Element) return {
      action: 'REPLACE',
      value: Array.from(currentValue.childNodes).length
    }
    if (currentValue instanceof Text) return {
      action: 'REPLACE',
      value: currentValue.data.length
    }
    return {
      action: 'ERROR',
      value: `Current value must be of type string, Array, NodeList, Element or Text`
    }
  })
}
