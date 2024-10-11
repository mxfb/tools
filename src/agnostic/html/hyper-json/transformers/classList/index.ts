import { Transformers } from '..'
import { Cast } from '../../cast'
import { Crossenv } from '../../crossenv'
import { Types } from '../../types'

enum Actions {
  ADD = 'add',
  REMOVE = 'remove',
  TOGGLE = 'toggle'
}

export const classList: Types.TransformerGenerator = (callerTagName, ...args): Types.Transformer => {
  return Transformers.toNamed(callerTagName, currentValue => {
    const { Element } = Crossenv.getWindow()
    if (!(currentValue instanceof Element)) return {
      action: 'ERROR',
      value: 'Current value must be an Element'
    }
    const [actionArg, classNameArg] = args
    if (actionArg === undefined || classNameArg === undefined) return {
      action: 'ERROR',
      value: `Expecting 2 arguments: (action: 'add' | 'remove' | 'toggle', classList: string)`
    }
    const action = Cast.toString(actionArg)
    const className = Cast.toString(actionArg).trim()
    if (action === Actions.ADD) {
      const outputValue = currentValue.cloneNode(true) as Element
      outputValue.classList.add(className)
      return { action: 'REPLACE', value: outputValue }
    } else if (action === Actions.REMOVE) {
      const outputValue = currentValue.cloneNode(true) as Element
      outputValue.classList.remove(className)
      return { action: 'REPLACE', value: outputValue }
    } else if (action === Actions.TOGGLE) {
      const outputValue = currentValue.cloneNode(true) as Element
      outputValue.classList.toggle(className)
      return { action: 'REPLACE', value: outputValue }
    }
    return {
      action: 'ERROR',
      value: `Unknown action: ${action}`
    }
  })
}
