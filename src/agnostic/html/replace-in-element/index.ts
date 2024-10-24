import { getNodeAncestors } from '../get-node-ancestors'

export function replaceInElement (inputElement: Element, replaceMap: Map<Node, Node>): Element {
  const actualReplaceMap = new Map(Array.from(replaceMap).filter(([toReplace]) => {
    const toReplaceAncestors = getNodeAncestors(toReplace)
    return toReplaceAncestors.includes(inputElement)
  }))
  actualReplaceMap.forEach((replacer, toReplace) => {
    toReplace.parentNode?.insertBefore(replacer, toReplace)
    toReplace.parentNode?.removeChild(toReplace)
  })
  return inputElement
}
