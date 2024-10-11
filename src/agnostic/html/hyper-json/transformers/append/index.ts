import { Transformers } from '..'
import { Cast } from '../../cast'
import { Crossenv } from '../../crossenv'
import { Types } from '../../types'

export const append: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => {
    const { document, Element, Text, NodeList } = Crossenv.getWindow()
    const [...toAppend] = args
    const frag = document.createDocumentFragment()
    frag.append(...Array
      .from(Cast.toNodeList(currentValue))
      .map(e => e.cloneNode(true)))
    toAppend.forEach(item => {
      if (item instanceof Element) frag.append(item.cloneNode(true))
      else if (item instanceof Text) frag.append(item.cloneNode(true))
      else if (item instanceof NodeList) frag.append(...Array.from(item).map(e => e.cloneNode(true)))
      else frag.append(Cast.toString(item))
    })
    return {
      action: 'REPLACE',
      value: frag.childNodes as NodeListOf<Element | Text>
    }
  })
}
