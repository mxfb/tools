import { isFalsy } from '~/agnostic/booleans/is-falsy'
import { isInEnum } from '~/agnostic/objects/enums/is-in-enum'
import { isRecord } from '~/agnostic/objects/is-record'
import { getWindow } from '~/agnostic/misc/crossenv/get-window'

export namespace HyperJson {
  // Cross-env stuff
  const crossenvWindow = getWindow()
  const document = crossenvWindow.document
  const Element = crossenvWindow.Element
  const Text = crossenvWindow.Text
  const Node = crossenvWindow.Node
  
  // Private utils
  const isElement = (node: Node): node is Element => node.nodeType === Node.ELEMENT_NODE
  const isText = (node: Node): node is Text => node.nodeType === Node.TEXT_NODE
  
  export enum TyperTagName {
    NULL = 'null',
    BOOLEAN = 'boolean',
    NUMBER = 'number',
    STRING = 'string',
    TEXT = 'text',
    NODELIST = 'nodelist',
    ARRAY = 'array',
    RECORD = 'record'
  }
  
  export enum TransformerTagName {
    MAP = 'map',
    REF = 'ref',
    ADD = 'add',
    MULT = 'mult',
    APPEND = 'append'
  }
  
  export type PrimitiveValue = null | string | number | boolean | Element | Text | NodeListOf<Text | Element>
  export type Value = PrimitiveValue | Value[] | { [k: string]: Value }
  export type Transformer = (input: Value) => Value
  
  export class Tree<T extends Element | Text = Element | Text> {
    readonly node: T
    readonly name: string | null
    readonly parent: Tree | null
    readonly root: Tree
    readonly path: ReadonlyArray<string | number>
    readonly pathString: string
    readonly tagName: T extends Element ? Element['tagName'] : null
    readonly attributes: T extends Element ? ReadonlyArray<Readonly<Attr>> : null
    readonly subtrees: ReadonlyMap<string | number, Tree> = new Map()
    readonly children: ReadonlyArray<Tree>
    readonly type: 'element' | 'text' | 'null' | 'number' | 'string' | 'boolean' | 'nodelist' | 'array' | 'record' | 'transformer'
  
    constructor (node: T)
    constructor (node: T, parent: Tree, pathFromParent: number | string)
    constructor (node: T, parent?: Tree, pathFromParent?: number | string) {

      this.initValue = this.initValue.bind(this)
      this.getInnerValue = this.getInnerValue.bind(this)
      this.wrapInnerValue = this.wrapInnerValue.bind(this)
      this.evaluate = this.evaluate.bind(this)

      // Node, parent, root
      this.node = node
      this.name = this.node instanceof Element ? this.node.getAttribute('_name') : null
      this.parent = parent ?? null
      this.root = this.parent === null ? this : this.parent.root
      // Path, pathString
      if (this.parent === null) this.path = []
      else if (pathFromParent === undefined) { this.path = [...this.parent.path, 0] }
      else { this.path = [...this.parent.path, pathFromParent] }
      this.pathString = `/${this.path.join('/')}`
      // Tagname, attributes
      this.tagName = (node instanceof Element ? node.tagName.toLowerCase() : null) as T extends Element ? Element['tagName'] : null
      this.attributes = (isElement(node) ? Array.from(node.attributes) : null) as T extends Element ? Attr[] : null
      // Subtrees
      const { childNodes } = node
      let positionnedChildrenCount = 0
      const mutableSubtrees = new Map<string | number, Tree>()
      Array.from(childNodes).filter((node): node is Element | Text => {
        if (isElement(node)) return true
        if (isText(node)) return true
        return false
      }).forEach(childNode => {
        if (childNode instanceof Text) {
          mutableSubtrees.set(
            positionnedChildrenCount,
            new Tree(childNode, this, positionnedChildrenCount)
          )
          positionnedChildrenCount += 1
        } else {
          const propertyName = childNode.getAttribute('_name')
          if (propertyName === null) {
            mutableSubtrees.set(
              positionnedChildrenCount,
              new Tree(childNode, this, positionnedChildrenCount)
            )
            positionnedChildrenCount += 1
          } else {
            mutableSubtrees.set(
              propertyName,
              new Tree(childNode, this, propertyName)
            )
          }
        }
      })
      this.subtrees = mutableSubtrees
      // Children
      this.children = Array.from(this.subtrees.values())
      // Type
      if (this.tagName === null) { this.type = 'text' }
      else if (this.tagName === TyperTagName.NULL) { this.type = 'null' }
      else if (this.tagName === TyperTagName.BOOLEAN) { this.type = 'boolean' }
      else if (this.tagName === TyperTagName.NUMBER) { this.type = 'number' }
      else if (this.tagName === TyperTagName.STRING) { this.type = 'string' }
      else if (this.tagName === TyperTagName.TEXT) { this.type = 'text' }
      else if (this.tagName === TyperTagName.NODELIST) { this.type = 'nodelist' }
      else if (this.tagName === TyperTagName.ARRAY) { this.type = 'array' }
      else if (this.tagName === TyperTagName.RECORD) { this.type = 'record' }
      else if (isInEnum(TransformerTagName, this.tagName as any)) { this.type = 'transformer' }
      else { this.type = 'element' }
    }
  
    initValue (this: Tree<T>): Value {
      const { type } = this
      let currentValue: Value
      if (type === 'null') { currentValue = null }
      else if (type === 'boolean') { currentValue = false }
      else if (type === 'number') { currentValue = 0 }
      else if (type === 'string') { currentValue = '' }
      else if (type === 'text') { currentValue = this.node.textContent }
      else if (type === 'element') { currentValue = document.createDocumentFragment().childNodes as NodeListOf<Element | Text> }
      else if (type === 'nodelist') { currentValue = document.createDocumentFragment().childNodes as NodeListOf<Element | Text> }
      else if (type === 'array') { currentValue = [] }
      else if (type === 'record') { currentValue = {} }
      else if (type === 'transformer') { currentValue = [] } // WIP assume array since we want to obtain an array of params ?
      else { currentValue = null } // normally type: never here
      return currentValue
    }
  
    getInnerValue (this: Tree<T>, initialValue: Value) {
      const { subtrees } = this
      const innerValue = Array
        .from(subtrees.entries())
        .reduce((currentValue, [subpath, subTree]) => {
          // If child is a transformer, call it on current value
          if (subTree.type === 'transformer') {
            const evaluated = subTree.evaluate() as Transformer
            return evaluated(currentValue)
          }
  
          // Current value : null, boolean, number, string, Text or Element
          if (currentValue === null
            || typeof currentValue === 'boolean'
            || typeof currentValue === 'number'
            || typeof currentValue === 'string'
            || currentValue instanceof Text
            || currentValue instanceof Element
          ) {
            const evaluated = subTree.evaluate() as Value
            // evaluated : null, boolean, number, string, array, record
            if (evaluated === null
              || typeof evaluated === 'boolean'
              || typeof evaluated === 'number'
              || typeof evaluated === 'string'
              || Array.isArray(evaluated)
              || isRecord(evaluated)) {
              return evaluated
            }
            // evaluated : Element, Text, Nodelist
            const frag = document.createDocumentFragment()
            frag.append(`${currentValue}`)
            if (evaluated instanceof Element
              || evaluated instanceof Text) {
              frag.append(evaluated)
              return frag.childNodes as NodeListOf<Element | Text>
            }
            frag.append(...Array.from(evaluated))
            return frag.childNodes as NodeListOf<Element | Text>
          }
  
          // Current value : Array
          if (Array.isArray(currentValue)) {
            if (typeof subpath === 'string') return currentValue
            return [...currentValue, subTree.evaluate() as Value]
          }
  
          // Current value : NodeList
          if (currentValue instanceof NodeList) {
            const evaluated = subTree.evaluate() as Value
            // Evaluated is Element or Text
            if (evaluated instanceof Element
              || evaluated instanceof Text) {
              const frag = document.createDocumentFragment()
              frag.append(...Array.from(currentValue), evaluated)
              return frag.childNodes as NodeListOf<Element | Text>
            }
            // Evaluated is NodeList
            if (evaluated instanceof NodeList) {
              const frag = document.createDocumentFragment()
              frag.append(
                ...Array.from(currentValue),
                ...Array.from(evaluated)
              )
              return frag.childNodes as NodeListOf<Element | Text>
            }
            // Evaluated is primitive
            if (evaluated === null
              || typeof evaluated === 'string'
              || typeof evaluated === 'number'
              || typeof evaluated === 'boolean') {
              const frag = document.createDocumentFragment()
              frag.append(...Array.from(currentValue), `${evaluated}`)
              return frag.childNodes as NodeListOf<Element | Text>
            }
            // Evaluated is Array
            if (Array.isArray(evaluated)) return [...Array.from(currentValue), ...evaluated]
            // Evaluated is Record
            return { ...evaluated }
          }
  
          // Current value : Record
          if (typeof subpath === 'number') return currentValue
          return {
            ...currentValue,
            [subpath]: subTree.evaluate() as Value
          }
  
        }, initialValue)
      return innerValue
    }

    wrapInnerValue (this: Tree<T>, innerValue: Value): Value | Transformer {
      const { type, node } = this
      // Si transformer, soit inner est un array et on le prend comme la liste de param
      // soit innerValue est le premier param donné au transformer
      if (type === 'transformer') return (contextValue: Value) => {
        console.log(`I am a transformer. My name is ${this.tagName}.`)
        console.log('I have this innerValue (these are my params):')
        console.log(innerValue)
        console.log('And this context value:')
        console.log(contextValue)
        return contextValue
      }

      /* [WIP] Below, possibly better to use cast transformer generators
         rather than having a specific/different innerValue to type process here */
      if (type === 'null') return null
      if (type === 'boolean') return !isFalsy(innerValue)
      if (type === 'number') return parseFloat(`${innerValue}`)
      if (type === 'string') return `${innerValue}`
      if (type === 'array') {
        if (Array.isArray(innerValue)) return innerValue
        if (innerValue instanceof NodeList) {
          return [...Array.from(innerValue)]
        }
        return [innerValue]
      }
      if (type === 'record') {
        if (isRecord(innerValue)) return innerValue
        return {}
      }
      if (type === 'text') return document.createTextNode(`${innerValue}`)
      if (type === 'element') {
        const wrapper = node.cloneNode() as Element
        // [WIP] strip the _name attribute here if necessary
        if (innerValue instanceof NodeList) {
          wrapper.append(...Array.from(innerValue))
          return wrapper
        }
        if (innerValue instanceof Element
          || innerValue instanceof Text
          || typeof innerValue === 'string') {
          wrapper.append(innerValue)
          return wrapper
        }
        if (innerValue === null
          || typeof innerValue === 'number'
          || typeof innerValue === 'boolean') {
          wrapper.append(`${innerValue}`)
          return wrapper
        }
        return wrapper
      }
      // type is nodelist
      if (innerValue instanceof NodeList) return innerValue
      if (innerValue instanceof Element
        || innerValue instanceof Text
        || typeof innerValue === 'string') {
        const frag = document.createDocumentFragment()
        frag.append(innerValue)
        return frag.childNodes as NodeListOf<Element | Text>
      }
      if (innerValue === null
        || typeof innerValue === 'string'
        || typeof innerValue === 'number'
        || typeof innerValue === 'boolean') {
        const frag = document.createDocumentFragment()
        frag.append(`${innerValue}`)
        return frag.childNodes as NodeListOf<Element | Text>
      }
      const frag = document.createDocumentFragment()
      return frag.childNodes as NodeListOf<Element | Text>
    }
  
    evaluate (this: Tree<T>): Value | Transformer {
      const init = this.initValue()
      const inner = this.getInnerValue(init)
      const wrapped = this.wrapInnerValue(inner)
      return wrapped
    }
  }
}
