import { replaceAll } from '~/agnostic/strings/replace-all'
import { Transformers } from '..'
import { Cast } from '../../cast'
import { Crossenv } from '../../crossenv'
import { Types } from '../../types'

export const replace: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => {
    const { Text, NodeList, Element } = Crossenv.getWindow()
    if (typeof currentValue !== 'string'
      && !(currentValue instanceof Text)
      && !(currentValue instanceof Element)
      && !(currentValue instanceof NodeList)) return {
      action: 'ERROR',
      value: 'Current value must be string, Text, Element or NodeList'
    }
    if (args.some(arg => typeof arg !== 'string'
      && !(arg instanceof Text)
      && !(arg instanceof Element)
      && !(arg instanceof NodeList))) return {
      action: 'ERROR',
      value: 'Arguments must be of type string, Text, Element or NodeList'
    }
    const [first, second] = args as Array<string | Text | Element | NodeListOf<Element | Text>>
    if (first === undefined || second === undefined) return {
      action: 'ERROR',
      value: `Expecting at least 2 arguments. Found only ${args.length}`
    }
    const replacer = args.at(-1) as string | Text | Element | NodeListOf<Element | Text>
    const strReplacer = Cast.toString(replacer)
    const toReplace = args.slice(0, -1)
    const strToReplace = toReplace.map(Cast.toString)
    const strInput = Cast.toString(currentValue)
    const strOutput = strToReplace.reduce((str, torpl) => replaceAll(str, torpl, strReplacer), strInput)
    if (typeof currentValue === 'string') return { action: 'REPLACE', value: strOutput }
    if (currentValue instanceof Text) return { action: 'REPLACE', value: Cast.toText(strOutput) }
    if (currentValue instanceof Element) return { action: 'REPLACE', value: Cast.toElement(strOutput) }
    if (currentValue instanceof NodeList) return { action: 'REPLACE', value: Cast.toNodeList(strOutput) }
    return { action: null }
  })
}
