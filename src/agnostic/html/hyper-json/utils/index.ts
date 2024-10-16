import { Tree } from '../tree'
import { Types } from '../types'

export namespace Utils {
  export const pathStringToPath = (pathString: Tree.Tree['pathString']): Tree.Tree['path'] => {
    let cleanPathString = pathString
    while (cleanPathString.startsWith('/')) { cleanPathString = cleanPathString.slice(1) }
    while (cleanPathString.endsWith('/')) { cleanPathString = cleanPathString.slice(0, -1) }
    return cleanPathString.split('/').map(e => {
      const parsed = parseInt(e)
      if (Number.isNaN(parsed)) return e
      return parsed
    })
  }

  export const pathToPathString = (path: Tree.Tree['path']) => `/${path.map(e => `${e}`).join('/')}`

  type ErrReturn = Types.TransformerErrorReturnType
  export const makeTransformerError = (value: ErrReturn['value']): ErrReturn => ({
    action: 'ERROR',
    value
  })

  export const toNamedTransformer = (
    name: string,
    anonymous: Types.AnonymousTransformer): Types.Transformer => {
    const named = anonymous as Types.Transformer
    named.transformerName = name
    return named
  }
}
