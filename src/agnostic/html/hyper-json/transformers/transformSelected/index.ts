import { replaceInElement } from '~/agnostic/html/replace-in-element'
import { isRecord } from '~/agnostic/objects/is-record'
import { Cast } from '../../cast'
import { Crossenv } from '../../crossenv'
import { Types } from '../../types'
import { Tree } from '../../tree'
import { Utils } from '../../utils'

export const transformSelected: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, (currentValue, callerTree) => {
    const { NodeList, Element, Text } = Crossenv.getWindow()
    if (!(currentValue instanceof Element)
      && !(currentValue instanceof NodeList)) return Utils.makeTransformerError({
      message: 'Current value must be Element or NodeList',
      input: currentValue
    })
    const [selector, ...transformerDescriptors] = args
    if (typeof selector !== 'string'
      && !(selector instanceof Text)) return Utils.makeTransformerError({
      message: 'Selector argument must be string or text',
      input: selector !== undefined ? selector : '<undefined>'
    })
    if (transformerDescriptors.length === 0) return Utils.makeTransformerError('No transformer descriptor provided')
    let transformers: Types.Transformer[] = []
    for (const descriptor of transformerDescriptors) {
      const errorResponse: Types.TransformerReturnType = Utils.makeTransformerError({
        message: 'Transformer descriptors must be of shape { name: string, arguments: Value[] }',
        input: descriptor
      })
      if (!isRecord(descriptor)) return errorResponse
      if (!('name' in descriptor) || typeof descriptor.name !== 'string') return errorResponse
      if (!('arguments' in descriptor) || !Array.isArray(descriptor.arguments)) return errorResponse
      const { name, arguments: args } = descriptor
      const generator = callerTree.getGenerator(name)
      if (generator === undefined) return Utils.makeTransformerError(`No transformer found under the name ${name}`)
      transformers.push(generator(name, ...args))
    }
    const elementInput = Cast.toElement(currentValue)
    const strSelector = Cast.toString(selector)
    const selected = Array.from(elementInput.querySelectorAll(strSelector))
    const transformationErrors: Array<{
      message: Types.Value,
      transformerName: string,
      transformerPos: number,
      transforming: Types.Value
    }> = []
    const transformed = selected.map(input => {
      const output = transformers.reduce((reduced, transformer, transformerPos) => {
        const result = transformer(reduced, callerTree)
        if (result.action === 'REPLACE') return result.value
        else if (result.action === 'MERGE') {
          const merged = Tree.mergeValues(
            reduced,
            result.value,
            transformerPos,
            callerTree)
          return merged
        }
        if (result.action === 'ERROR') transformationErrors.push({
          message: result.value,
          transformerName: transformer.transformerName,
          transformerPos,
          transforming: reduced
        })
        return reduced
      }, input as Types.Value)
      return { input, output }
    })
    if (transformationErrors.length !== 0) return Utils.makeTransformerError({
      message: 'Some nested transformers returned an error',
      errors: transformationErrors
    })
    const nonElementTransformResult = transformed.find(item => !(item.output instanceof Element))
    if (nonElementTransformResult !== undefined) return Utils.makeTransformerError({
      message: 'Some transformations resulted in a non Element output',
      inputElement: nonElementTransformResult.input,
      outputValue: nonElementTransformResult.output
    })
    const transformMap = new Map(transformed.map(e => [e.input, e.output as Element]))
    const elementOutput = replaceInElement(elementInput, transformMap)
    return {
      action: 'REPLACE',
      value: elementOutput
    }
  })
}
