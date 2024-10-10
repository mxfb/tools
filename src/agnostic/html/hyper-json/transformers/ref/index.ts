import { Cast } from '../../cast'
import { Types } from '../../types'

export const ref: Types.TransformerGenerator = (mergeKey: string | number, ...args): Types.Transformer => {
  return (currentValue, { merger, resolver }) => {
    const [refPathStrRaw] = args
    let refPathStr = Cast.toString(refPathStrRaw ?? '')
    while (refPathStr.startsWith('/')) { refPathStr = refPathStr.slice(1) }
    while (refPathStr.endsWith('/')) { refPathStr = refPathStr.slice(0, -1) }
    const refPath = refPathStr.split('/')
    const foundTree = resolver(refPath)
    if (foundTree === undefined) return currentValue
    const evaluated = foundTree.evaluate()
    return merger(currentValue, evaluated, mergeKey)
  }
}
