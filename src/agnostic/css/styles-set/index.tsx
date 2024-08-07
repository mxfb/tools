import { JSX, Component } from 'react'
import { render as reactRender } from 'react-dom'
import {
  createRoot as reactCreateRoot,
  Root as ReactRoot
} from 'react-dom/client'
import { Random } from '~/agnostic/misc/random'

export type StylesSetItem = {
  type: 'string' | 'url'
  content: string
  id?: string
  position?: number
  onLoad?: () => void
}

export class StylesSet {
  static defaultPrivateIDAttribute = 'data-styleset-private-id'
  static defaultPublicIDAttribute = 'data-styleset-public-id'
  private _items = new Map<string, StylesSetItem>()
  get items () {
    const sortedItemsArray = Array.from(this._items).map(([privateId, item]) => {
      return {
        targetPosition: this.getTargetPosition(privateId) ?? 0,
        privateId,
        item
      }
    }).sort((a, b) => a.targetPosition - b.targetPosition)
     .map(({ item, privateId }) => ([privateId, item] as [string, StylesSetItem]))
    const sortedItemsMap = new Map(sortedItemsArray)
    return sortedItemsMap
  }
  tagsPrivateIDAttribute = StylesSet.defaultPrivateIDAttribute
  tagsPublicIDAttribute = StylesSet.defaultPublicIDAttribute

  private getTargetPosition (privateId: string) {
    const orderedStyles = Array.from(this._items)
      .map(([privateId, data]) => ({ privateId, data }))
      .sort((a, b) => {
        const aPos = a.data.position ?? 0
        const bPos = b.data.position ?? 0
        return aPos - bPos
      })
    const foundIndex = orderedStyles.findIndex(item => item.privateId === privateId)
    return foundIndex === -1 ? null : foundIndex
  }

  setTagsPrivateIDAttribute (str: string): this {
    this.tagsPrivateIDAttribute = str
    return this
  }

  setTagsPublicIDAttribute (str: string): this {
    this.tagsPublicIDAttribute = str
    return this
  }

  getById (id: string): StylesSetItem | undefined {
    const found = Array.from(this._items.values())
      .find(entry => entry.id === id)
    if (found === undefined) return undefined
    return found
  }

  generateUniquePrivateId (): string {
    const existingIds = Array.from(this._items.keys())
    const generated = Random.randomHash(12)
    if (existingIds.includes(generated)) return this.generateUniquePrivateId()
    return generated
  }

  getComp (): JSX.Element {
    const items = this.items
    const comp = <StylesSetComp
      items={items}
      privateIDAttribute={this.tagsPrivateIDAttribute}
      publicIDAttribute={this.tagsPublicIDAttribute} />
    return comp
  }

  private _rendered = new Map<Element, ReactRoot>()
  render (element: Element): this {
    const root = reactCreateRoot(element)
    root.render(this.getComp())
    this._rendered.set(element, root)
    return this
  }

  unmount (element: Element): this {
    if (!this._rendered.has(element)) return this
    const root = this._rendered.get(element)
    if (root === undefined) return this
    root.unmount()
    this._rendered.delete(element)
    return this
  }

  updateRendered (): this {
    this._rendered.forEach((root) => root.render(this.getComp()))
    return this
  }

  addItem (item: StylesSetItem, abortIfIdExists: boolean = true): this {
    const existing = Array
      .from(this._items.entries())
      .map(([privateId, entry]) => ({ privateId, entry }))
      .find(({ entry }) => (entry.id !== undefined && entry.id === item.id))
    if (existing !== undefined) {
      if (abortIfIdExists) return this
      this._items.delete(existing.privateId)
    }
    const privateId = this.generateUniquePrivateId()
    this._items.set(privateId, item)
    this.updateRendered()
    return this
  }

  removeItem (idOrPosition: string | number): this {
    if (typeof idOrPosition === 'string') {
      const existing = Array
        .from(this._items.entries())
        .map(([privateId, entry]) => ({ privateId, entry }))
        .find(({ entry }) => (entry.id !== undefined && entry.id === idOrPosition))
      if (existing === undefined) return this
      this._items.delete(existing.privateId)
      this.updateRendered()
      return this
    }
    const toRemove = Array
      .from(this._items)
      .map(([privateId, entry]) => ({ privateId, entry }))
      .at(idOrPosition)
    if (toRemove === undefined) return this
    this._items.delete(toRemove.privateId)
    this.updateRendered()
    return this
  }

  async getDomString (documentObj: Document) {
    return new Promise(resolve => {
      const tempElt = documentObj.createElement('div')
      reactRender(this.getComp(), tempElt, () => resolve(tempElt.innerHTML))
    })
  }
}

export type StylesSetCompProps = {
  items?: StylesSet['items']
  privateIDAttribute?: StylesSet['tagsPrivateIDAttribute']
  publicIDAttribute?: StylesSet['tagsPublicIDAttribute']
}

export class StylesSetComp extends Component<StylesSetCompProps> {
  render () {
    const { props } = this
    const items: StylesSet['items'] = props.items ?? new Map()
    const pidAttr = props.privateIDAttribute ?? StylesSet.defaultPrivateIDAttribute
    const idAttr = props.publicIDAttribute ?? StylesSet.defaultPublicIDAttribute
    return <>{Array.from(items).map(([privateId, itemData]) => {
      const customAttributes = { [pidAttr]: privateId, [idAttr]: itemData.id }
      if (itemData.type === 'url') return <link
        onLoad={itemData.onLoad}
        rel='stylesheet'
        href={itemData.content}
        {...customAttributes} />
      return <style {...customAttributes}>
        {itemData.content}
      </style>
    })}</>
  }
}
