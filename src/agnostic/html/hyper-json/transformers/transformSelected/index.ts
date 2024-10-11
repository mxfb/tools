import { Transformers } from '..'
import { Cast } from '../../cast'
import { Crossenv } from '../../crossenv'
import { Types } from '../../types'

export const transformSelected: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Transformers.toNamed(callerTagName, (currentValue, { resolver }) => {
    const { NodeList, Element, Text } = Crossenv.getWindow()
    const [selector] = args
    if (typeof selector !== 'string'
      && !(selector instanceof Text)) return {
      action: 'ERROR',
      value: {
        message: 'Selector argument must be string or text',
        input: selector !== undefined ? selector : '<undefined>'
      }
    }
    if (!(currentValue instanceof Element)
      && !(currentValue instanceof NodeList)) return {
      action: 'ERROR',
      value: {
        message: 'Current value must be Element or NodeList',
        input: currentValue
      }
    }
    const elementInput = Cast.toElement(currentValue)
    const strSelector = Cast.toString(selector)
    const selected = Array.from(elementInput.querySelectorAll(strSelector))

    return { action: null }
  })
}


// import { Darkdouille } from '../..'
// import { resolveArgs } from '../_utils/resolveArgs'
// import toNodeList from '../_utils/toNodeList'
// import insertNode from '~/utils/insert-node'
// import toHtml from '../toNodeList'
// import toString from '../toString'
// import clone from '../clone'

// const transformSelected: Darkdouille.TransformerFunctionGenerator<NodeListOf<Node>> = (...args) => {
//   const [rawSelectorOrTransformer, ...rawLeftTransformers] = args
//   return (inputValue): NodeListOf<Node> => {
//     const htmlInput = toHtml()(inputValue)
//     const firstArgIsSelector = typeof rawSelectorOrTransformer !== 'function'
//     const strSelector = firstArgIsSelector ? toString()(rawSelectorOrTransformer) : undefined
//     const rawTransformers = firstArgIsSelector ? [...rawLeftTransformers] : [rawSelectorOrTransformer, ...rawLeftTransformers]
//     const fragment = document.createDocumentFragment()
//     fragment.append(...htmlInput)
//     const targets = strSelector === undefined ? [...fragment.children] : [...fragment.querySelectorAll(strSelector)]
//     targets.forEach(target => {
//       const clonedTarget = target.cloneNode(true) as Element
//       const toTransform = clone<NodeListOf<Node>>()(toNodeList(clonedTarget))
//       const rawTransformed = rawTransformers.reduce<Darkdouille.TreeValue>((reduced, rawTransformer) => {
//         const resolvedTransformer = resolveArgs(reduced, rawTransformer)[0]
//         return resolvedTransformer
//       }, toTransform)
//       const htmlTransformed = toHtml()(rawTransformed)
//       Array
//         .from(htmlTransformed)
//         .reverse()
//         .forEach(node => insertNode(node, 'after', target))
//       target.remove()
//     })
//     return fragment.childNodes
//   }
// }

// export default transformSelected
