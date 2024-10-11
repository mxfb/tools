import { Transformers } from '..'
import { Cast } from '../../cast'
import { Types } from '../../types'

export const ref: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Transformers.toNamed(callerTagName, (_, { resolver }) => {
    const [refPathStrRaw] = args
    let refPathStr = Cast.toString(refPathStrRaw ?? '')
    while (refPathStr.startsWith('/')) { refPathStr = refPathStr.slice(1) }
    while (refPathStr.endsWith('/')) { refPathStr = refPathStr.slice(0, -1) }
    const refPath = refPathStr.split('/').map(e => {
      const parsed = parseInt(e)
      if (Number.isNaN(parsed)) return e
      return parsed
    })
    const foundTree = resolver(refPath)
    if (foundTree === undefined) return {
      action: 'ERROR',
      value: {
        message: 'Referenced value has not been found',
        input: refPathStr
      }
    }
    const evaluated = foundTree.evaluate()
    return {
      action: 'MERGE',
      value: evaluated
    }
  })
}
