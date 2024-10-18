import { Crossenv } from '../crossenv'
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
    args: Types.Value[],
    anonymous: Types.AnonymousTransformer): Types.Transformer => {
    const named = anonymous as Types.Transformer
    named.transformerName = name
    named.args = args
    return named
  }

  export const toHyperJson = (
    value: Types.Value,
    keyAttribute: string = Tree.defaultKeyAttribute): Element => {
    const { document, Element, Text, NodeList } = Crossenv.getWindow()
    if (value instanceof Text) {
      const elt = document.createElement('text')
      elt.innerHTML = value.textContent ?? ''
      return elt
    }
    if (value instanceof Element) return value.cloneNode(true) as Element
    if (value instanceof NodeList) {
      const elt = document.createElement('nodelist')
      elt.append(...Array.from(value).map(e => e.cloneNode(true)))
      return elt
    }
    if (value === null) return document.createElement('null')
    if (typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean') {
      const elt = document.createElement(typeof value)
      elt.innerHTML = `${value}`
      return elt
    }
    if (typeof value === 'function') {
      const name = value.transformerName
      const args = value.args
      const elt = document.createElement(name)
      const hyperJsonArgs = args.map(arg => toHyperJson(arg, keyAttribute))
      elt.append(...hyperJsonArgs)
      return elt
    }
    if (Array.isArray(value)) {
      const elt = document.createElement('array')
      elt.append(...value.map(e => toHyperJson(e, keyAttribute)))
      return elt
    }
    // Value is record
    const elt = document.createElement('record')
    Object.entries(value).forEach(([key, val]) => {
      const hjVal = toHyperJson(val)
      hjVal.setAttribute(keyAttribute, key)
      elt.append(hjVal)
    })
    return elt
  }
}
