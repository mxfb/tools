import { Sanitize } from '~/agnostic/html/sanitize'
import { Crossenv } from '~/agnostic/misc/crossenv'
import {
  Codes as LibErrorCodes,
  register as libErrorsRegister
} from '~/shared/errors'

type Options = {
  sanitize?: Sanitize.Options,
  documentObj?: Document
}

// [WIP] should not embed sanitizing stuff
export function stringToNodes (dirtyStr: string, options?: Options): Node[] {
  const actualDocument = options?.documentObj ?? Crossenv.getDocument()
  if (actualDocument === null) throw libErrorsRegister.getError(LibErrorCodes.NO_DOCUMENT_PLEASE_PROVIDE, 'See documentObj in the options object')
  const sanitizeOptions: Sanitize.Options = {
    ...options?.sanitize,
    documentObj: options?.sanitize?.documentObj ?? options?.documentObj
  }
  const str = options?.sanitize !== undefined ? Sanitize.sanitize(dirtyStr, sanitizeOptions) : dirtyStr
  const wrapperDiv = actualDocument.createElement('div')
  wrapperDiv.innerHTML = str
  const nodes = Array.from(wrapperDiv.childNodes).filter(node => {
    const allowedNodeTypes: number[] = [Node.ELEMENT_NODE, Node.TEXT_NODE]
    return allowedNodeTypes.includes(node.nodeType)
  })
  return nodes
}
