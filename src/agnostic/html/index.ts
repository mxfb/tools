import { getNodeAncestors as getNodeAncestorsFunc } from './get-node-ancestors'
import { getPositionInsideParent as getPositionInsideParentFunc } from './get-position-inside-parent'
import {
  InsertNodePosition as InsertNodePositionType,
  insertNode as insertNodeFunc
} from './insert-node'
import { Placeholders as PlaceholdersNamespace } from './placeholders'
import { Sanitize as SanitizeNamespace } from './sanitize'
import { selectorToElement as selectorToElementFunc } from './selector-to-element'
import { stringToNodes as stringToNodesFunc } from './string-to-nodes'

export namespace Html {
  // Get node ancestors
  export const getNodeAncestors = getNodeAncestorsFunc
  // Get position inside parnet
  export const getPositionInsideParent = getPositionInsideParentFunc
  // Insert node
  export type InsertNodePosition = InsertNodePositionType
  export const insertNode = insertNodeFunc
  // Placeholders
  export import Placeholders = PlaceholdersNamespace
  // Sanitize
  export import Sanitize = SanitizeNamespace
  // Selector to element
  export const selectorToElement = selectorToElementFunc
  // String to nodes
  export const stringToNodes = stringToNodesFunc
}
