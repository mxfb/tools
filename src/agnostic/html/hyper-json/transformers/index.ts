import { Types } from '../types'
import { ref } from './ref'

export namespace Transformers {
  export const index = new Map([
    [Types.TransformerTagName.REF, ref]
  ] as const)

  export const get = (name: any) => index.get(name)
}

