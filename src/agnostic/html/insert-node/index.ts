export type InsertNodePosition = 'after' | 'before' | 'startof' | 'endof'

export function insertNode (node: Node, position: InsertNodePosition, reference: Node): void {
  if (position === 'after') {
    if (reference.nextSibling !== null) reference.parentNode?.insertBefore(node, reference.nextSibling)
    else reference.parentNode?.appendChild(node)
  } else if (position === 'before') {
    reference.parentNode?.insertBefore(node, reference)
  } else if (position === 'startof') {
    if (reference.firstChild !== null) reference.insertBefore(node, reference.firstChild)
    else reference.appendChild(node)
  } else {
    reference.appendChild(node)
  }
}
