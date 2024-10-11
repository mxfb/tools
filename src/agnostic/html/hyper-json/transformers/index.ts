import { Types } from '../types'
import { append } from './append'
import { ref } from './ref'

export namespace Transformers {
  export const defaultGeneratorsMap = new Map<string, Types.TransformerGenerator>([
    ['append', append],
    ['ref', ref]
  ])

  export const toNamed = (
    name: string,
    anonymous: Types.AnonymousTransformer): Types.Transformer => {
    const named = anonymous as Types.Transformer
    named.transformerName = name
    return named
  }
}
