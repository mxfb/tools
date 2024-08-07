export function getPositionInsideParent (node: Node): number | null {
  if (!node.parentNode) return null
  const childNodes = Array.from(node.parentNode.childNodes) as Array<Node>
  return childNodes.indexOf(node)
}
