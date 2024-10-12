import { Transformers } from '..'
import { Cast } from '../../cast'
import { Crossenv } from '../../crossenv'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const querySelector: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => {
    const { document, Element, NodeList } = Crossenv.getWindow()
    const [selectorRaw] = args
    if (selectorRaw === undefined) return Utils.makeTransformerError('Selector argument expected.')
    const selector = Cast.toString(selectorRaw)
    let toQuery: Element
    if (currentValue instanceof Element) { toQuery = currentValue.cloneNode(true) as Element }
    else if (currentValue instanceof NodeList) {
      toQuery = document.createElement('div')
      toQuery.append(...Array.from(currentValue).map(e => e.cloneNode(true)))
    } else return Utils.makeTransformerError('Current value must be an Element or a NodeList')
    const found = toQuery.querySelectorAll(selector)
    return {
      action: 'REPLACE',
      value: found
    }
  })
}
