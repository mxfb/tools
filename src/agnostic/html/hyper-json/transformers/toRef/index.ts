import { Cast } from '../../cast'
import { Crossenv } from '../../crossenv'
import { Types } from '../../types'
import { Utils } from '../../utils'

export const toRef: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Utils.toNamedTransformer(callerTagName, args, (currentValue, callerTree) => {
    const { Text } = Crossenv.getWindow()
    if (typeof currentValue !== 'string'
      && !(currentValue instanceof Text)) return Utils.makeTransformerError({
      message: 'Current value must be string or Text',
      input: currentValue
    })
    const refPathStr = Cast.toString(currentValue)
    const refPath = Utils.pathStringToPath(refPathStr)
    const foundTree = callerTree.resolve(refPath)
    if (foundTree === undefined) return Utils.makeTransformerError({
      message: 'Referenced value has not been found',
      input: refPathStr
    })
    const evaluated = foundTree.evaluate()
    return {
      action: 'REPLACE',
      value: evaluated
    }
  })
}
