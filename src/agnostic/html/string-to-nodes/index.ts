import { Sanitize } from '~/agnostic/html/sanitize'

type Options = {
  sanitize?: Sanitize.Options
}

export function stringToNodes (dirtyStr: string, documentObj: Document, options?: Options): Node[] {
  const document = documentObj
  const str = options?.sanitize !== undefined ? Sanitize.sanitize(dirtyStr, documentObj, options.sanitize) : dirtyStr
  const wrapperDiv = document.createElement('div')
  wrapperDiv.innerHTML = str
  const nodes = Array.from(wrapperDiv.childNodes).filter(node => {
    const allowedNodeTypes: number[] = [Node.ELEMENT_NODE, Node.TEXT_NODE]
    return allowedNodeTypes.includes(node.nodeType)
  })
  return nodes
}
