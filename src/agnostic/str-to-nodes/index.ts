import sanitize, { Options as SanitizerOptions } from '~/agnostic/clientside-html-sanitizer'
import { getDocument } from '~/agnostic/crossenv'

type Options = {
  sanitize?: SanitizerOptions
  documentObj?: Document
}

export default async function strToNodes (dirtyStr: string, options?: Options): Promise<Node[]> {
  const document = options?.documentObj ?? await getDocument()
  const str = options?.sanitize !== undefined
    ? await sanitize(dirtyStr, options.sanitize)
    : dirtyStr
  const wrapperDiv = document.createElement('div')
  wrapperDiv.innerHTML = str
  const nodes = Array.from(wrapperDiv.childNodes).filter(node => {
    const allowedNodeTypes: number[] = [Node.ELEMENT_NODE, Node.TEXT_NODE]
    return allowedNodeTypes.includes(node.nodeType)
  })
  return nodes
}
