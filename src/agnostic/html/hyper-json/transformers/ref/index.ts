import { Cast } from '../../cast'
import { Crossenv } from '../../crossenv'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const ref: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, (_, callerTree) => {
    const [refPathStrRaw] = args
    const { Text } = Crossenv.getWindow()
    if (typeof refPathStrRaw !== 'string'
      && !(refPathStrRaw instanceof Text)) return Utils.makeTransformerError({
      message: 'PathString must be of type string or Text',
      input: refPathStrRaw !== undefined
        ? refPathStrRaw
        : '<undefined>'
    })
    const refPathStr = Cast.toString(refPathStrRaw)
    const refPath = Utils.pathStringToPath(Cast.toString(refPathStrRaw))
    const foundTree = callerTree.resolve(refPath)
    if (foundTree === undefined) return Utils.makeTransformerError({
      message: 'Referenced value has not been found',
      input: refPathStr
    })
    const evaluated = foundTree.evaluate()
    return {
      action: 'MERGE',
      value: evaluated
    }
  })
}
