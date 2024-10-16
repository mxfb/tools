import { isRecord } from '~/agnostic/objects/is-record'
import { isInEnum } from '~/agnostic/objects/enums/is-in-enum'
import { Cast } from '../cast'
import { Crossenv } from '../crossenv'
import { Serialize } from '../serialize'
import { Transformers } from '../transformers'
import { Types } from '../types'

const getWindow = Crossenv.getWindow
const isElement = (node: Node): node is Element => node.nodeType === getWindow().Node.ELEMENT_NODE
const isText = (node: Node): node is Text => node.nodeType === getWindow().Node.TEXT_NODE

export namespace Tree {
  export const defaultKeyAttribute = '_key'
  export const defaultActionAttribute = '_action'
  export const defaultRootKey = '_ROOT_'

  export function mergeValues (
    currentValue: Types.Value,
    incomingValue: Types.Value,
    mergeKey: string | number,
    initiatorTree: Tree): Types.Value {
    const { Element, Text, NodeList, document } = getWindow()

    // incoming : transformer
    if (typeof incomingValue === 'function') {
      const evaluated = incomingValue(currentValue, initiatorTree)
      if (evaluated.action === null) return currentValue
      if (evaluated.action === 'REPLACE') return evaluated.value
      if (evaluated.action === 'ERROR') {
        const errorMessage = 'Tranformer error:'
          + `\nfrom: ${incomingValue.transformerName}`
          + `\nat: ${initiatorTree.pathString.slice(1)}/${mergeKey}`
          + `\nmessage:`
        console.warn(errorMessage, evaluated.value)
        return currentValue
      }
      return mergeValues(
        currentValue,
        evaluated.value,
        mergeKey,
        initiatorTree
      )
    }

    // currentValue : Array
    if (Array.isArray(currentValue)) {
      if (typeof mergeKey === 'string') return currentValue
      return [...currentValue, incomingValue]
    }

    // currentValue : null, boolean, number, string, Text, Element or transformer
    if (currentValue === null
      || typeof currentValue === 'boolean'
      || typeof currentValue === 'number'
      || typeof currentValue === 'string'
      || typeof currentValue === 'function'
      || currentValue instanceof Text
      || currentValue instanceof Element) {
      
      // incoming : null, boolean, number, string, array, record
      if (incomingValue === null
        || typeof incomingValue === 'boolean'
        || typeof incomingValue === 'number'
        || typeof incomingValue === 'string'
        || Array.isArray(incomingValue)
        || isRecord(incomingValue)) {
        return incomingValue
      }
      // incoming : Element, Text, Nodelist
      const frag = document.createDocumentFragment()
      if (currentValue instanceof Element || currentValue instanceof Text) frag.append(currentValue.cloneNode(true))
      else frag.append(`${currentValue}`)
      if (incomingValue instanceof Element || incomingValue instanceof Text) {
        frag.append(incomingValue.cloneNode(true))
        return frag.childNodes as NodeListOf<Element | Text>
      }
      frag.append(...Array.from(incomingValue).map(e => e.cloneNode(true)))
      return frag.childNodes as NodeListOf<Element | Text>
    }

    // currentValue : NodeList
    if (currentValue instanceof NodeList) {
      // incoming : Element or Text
      if (incomingValue instanceof Element || incomingValue instanceof Text) {
        const frag = document.createDocumentFragment()
        frag.append(...Array.from(currentValue).map(e => e.cloneNode(true)), incomingValue)
        return frag.childNodes as NodeListOf<Element | Text>
      }

      // incoming : NodeList
      if (incomingValue instanceof NodeList) {
        const frag = document.createDocumentFragment()
        frag.append(
          ...Array.from(currentValue).map(e => e.cloneNode(true)),
          ...Array.from(incomingValue).map(e => e.cloneNode(true))
        )
        return frag.childNodes as NodeListOf<Element | Text>
      }
      
      // incoming : primitive
      if (incomingValue === null
        || typeof incomingValue === 'string'
        || typeof incomingValue === 'number'
        || typeof incomingValue === 'boolean') {
        const frag = document.createDocumentFragment()
        frag.append(...Array.from(currentValue).map(e => e.cloneNode(true)), `${incomingValue}`)
        return frag.childNodes as NodeListOf<Element | Text>
      }
      
      // incoming : Array
      if (Array.isArray(incomingValue)) return [
        ...Array.from(currentValue),
        ...incomingValue
      ]
      
      // incoming : Record
      return { ...incomingValue }
    }

    // currentValue : Record
    if (typeof mergeKey === 'number') return currentValue

    return {
      ...currentValue,
      [mergeKey]: incomingValue
    }
  }

  export function mergeRootNodes (...args: Parameters<typeof mergeNodes>): Element | Text {
    const [nodes, options] = args
    const actionAttribute = options?.actionAttribute ?? defaultActionAttribute
    const keyAttribute = options?.keyAttribute ?? defaultKeyAttribute
    const rootKey = options?.rootKey ?? defaultRootKey
    const { Element } = getWindow()
    const elements = nodes.filter(e => e instanceof Element)
    elements.forEach(element => {
      element.setAttribute(keyAttribute, rootKey)
      const elementAction = element.getAttribute(actionAttribute) ?? Types.ReductionAction.APPEND
      element.setAttribute(actionAttribute, elementAction)
    })
    const merged = mergeNodes(elements, options)
    return merged
  }

  export function mergeNodes (
    nodes: Array<Element | Text>,
    options: {
      actionAttribute?: string,
      keyAttribute?: string,
      rootKey?: string
    } = {}): Element | Text {
    const [first, ...rest] = nodes
    const actionAttribute  = options?.actionAttribute ?? defaultActionAttribute
    const keyAttribute  = options?.keyAttribute ?? defaultKeyAttribute
    if (first === undefined) throw new Error('Expecting at least one node')
    const { Text, Element, document } = getWindow()

    /* Local utils function */
    function isTextOrElement (node: Node): node is Text | Element {
      return node instanceof Text || node instanceof Element
    }

    /* Shallow merge nodes */
    let CURRENT: Element | Text = first
    rest.forEach(node => {
      if (node instanceof Text) {
        CURRENT.remove()
        CURRENT = node
        return;
      }
      const actionRaw = node.getAttribute(actionAttribute)
      const action = isInEnum(Types.ReductionAction, actionRaw as any)
        ? actionRaw as Types.ReductionAction
        : Types.ReductionAction.REPLACE
      if (action === Types.ReductionAction.REPLACE) {
        CURRENT.remove()
        CURRENT = node
        return;
      }
      if (CURRENT instanceof Text) {
        if (node instanceof Text) {
          const appended = action === Types.ReductionAction.APPEND
            ? document.createTextNode(`${CURRENT.textContent}${node.textContent}`)
            : document.createTextNode(`${node.textContent}${CURRENT.textContent}`)
          CURRENT.remove()
          node.remove()
          CURRENT = appended
          return;
        }
        CURRENT.remove()
        CURRENT = node
        return;
      }
      if (node instanceof Text) {
        CURRENT.remove()
        CURRENT = node
        return;
      }
      const currentAttributes = Array.from(CURRENT.attributes)
      const nodeAttributes = Array.from(node.attributes)
      const nodeChildren = Array.from(node.childNodes).filter(isTextOrElement)
      const outputAttributes = action === Types.ReductionAction.APPEND
        ? [...currentAttributes, ...nodeAttributes]
        : [...nodeAttributes, ...currentAttributes]
      if (action === Types.ReductionAction.APPEND) CURRENT.append(...nodeChildren)
      else CURRENT.prepend(...nodeChildren)
      outputAttributes.forEach(attr => (CURRENT as Element).setAttribute(attr.name, attr.value))
      node.remove()
      return;
    })

    /* List child nodes sharing the same subpath */
    const wrapperChildren = Array.from(CURRENT.childNodes) as Array<Element | Text>
    const subpaths = new Map<string | number, Array<Element | Text>>()
    let positionnedChildrenCount = 0
    wrapperChildren.forEach(child => {
      if (child instanceof Text) {
        const childKey = positionnedChildrenCount
        const found = subpaths.get(childKey) ?? []
        found.push(child)
        subpaths.set(childKey, found)
        positionnedChildrenCount += 1
      } else {
        const rawChildKey = child.getAttribute(keyAttribute)
        const childKey = rawChildKey ?? positionnedChildrenCount
        const found = subpaths.get(childKey) ?? []
        found.push(child)
        subpaths.set(childKey, found)
        if (rawChildKey === null) { positionnedChildrenCount += 1 }
      }
    })

    /* For each node sharing a subpath, merge them */
    subpaths.forEach((nodes, subpath) => {
      if (nodes.length < 2) return
      return mergeNodes(nodes, {
        actionAttribute,
        keyAttribute
      })
    })

    /* At the end of the process, find and return wrapper's first child */
    return CURRENT
  }

  function fillOptions (options: Partial<Types.TreeOptions>): Types.TreeOptions {
    const defaultOptions: Types.TreeOptions = {
      generatorsMap: Transformers.defaultGeneratorsMap,
      keyAttribute: defaultKeyAttribute,
      actionAttribute: defaultActionAttribute
    }
    return {
      ...defaultOptions,
      ...options
    }
  }

  export class Tree<T extends Element | Text = Element | Text> {
    readonly node: T
    readonly name: string | null
    readonly parent: Tree | null
    readonly root: Tree
    readonly isRoot: boolean
    readonly path: ReadonlyArray<string | number>
    readonly pathString: string
    readonly tagName: T extends Element ? Element['tagName'] : null
    readonly attributes: T extends Element ? ReadonlyArray<Readonly<Attr>> : null
    readonly subtrees: ReadonlyMap<string | number, Tree> = new Map()
    readonly children: ReadonlyArray<Tree>
    readonly type: 'element' | 'text' | 'null' | 'number' | 'string' | 'boolean' | 'nodelist' | 'array' | 'record' | 'transformer'
    readonly generators: ReadonlyMap<string, Types.TransformerGenerator>
    keyAttribute: string
    actionAttribute: string
  
    constructor (node: T, parentOrOptions?: Partial<Types.TreeOptions>)
    constructor (node: T, parentOrOptions: Tree, pathFromParent: number | string, options?: Partial<Types.TreeOptions>)
    constructor (node: T, parentOrOptions?: Tree | Partial<Types.TreeOptions>, pathFromParent?: number | string, options?: Partial<Types.TreeOptions>) {
      this.resolve = this.resolve.bind(this)
      this.getGenerator = this.getGenerator.bind(this)
      this.initValue = this.initValue.bind(this)
      this.getInnerValue = this.getInnerValue.bind(this)
      this.wrapInnerValue = this.wrapInnerValue.bind(this)
      this.setCache = this.setCache.bind(this)
      this.getPerfCounters = this.getPerfCounters.bind(this)
      this.printPerfCounters = this.printPerfCounters.bind(this)
      this.pushToEvalCallStack = this.pushToEvalCallStack.bind(this)
      this.flushEvalCallStack = this.flushEvalCallStack.bind(this)
      this.evaluate = this.evaluate.bind(this)
  
      const { Element, Text } = getWindow()
  
      // Node, parent, root, generators
      const _node = node
      const _parent = parentOrOptions instanceof Tree ? parentOrOptions : undefined
      this.node = _node
      this.parent = _parent ?? null
      this.root = this.parent === null ? this : this.parent.root
      this.isRoot = this.root === this
  
      // Options
      const _options = options ?? parentOrOptions instanceof Tree
        ? fillOptions({})
        : fillOptions(parentOrOptions ?? {})
      this.keyAttribute = _options.keyAttribute
      this.actionAttribute = _options.actionAttribute
      this.generators = this.isRoot ? _options.generatorsMap : this.root.generators
      
      // Name, Path, pathString, pathFromParent
      this.name = this.node instanceof Element ? this.node.getAttribute(this.keyAttribute) : null
      const _pathFromParent = pathFromParent !== undefined ? pathFromParent : undefined
      if (this.parent === null) this.path = []
      else if (_pathFromParent === undefined) { this.path = [...this.parent.path, 0] }
      else { this.path = [...this.parent.path, _pathFromParent] }
      this.pathString = `/${this.path.join('/')}`
  
      // Tagname, attributes
      this.tagName = (node instanceof Element
        ? node.tagName.toLowerCase()
        : null
      ) as T extends Element
        ? Element['tagName']
        : null
      this.attributes = (isElement(node)
        ? Array.from(node.attributes)
        : null
      ) as T extends Element
        ? Attr[]
        : null
  
      // Subtrees
      const { childNodes } = node
      let positionnedChildrenCount = 0
      const mutableSubtrees = new Map<string | number, Tree>()
      Array.from(childNodes).filter((node, _, nodes): node is Element | Text => {
        if (isElement(node)) return true
        if (isText(node)) {
          const hasContent = (node.textContent ?? '').trim() !== ''
          if (hasContent) return true
          if (nodes.some(n => n instanceof Element)) return false
          return true
        }
        return false
      }).forEach(childNode => {
        if (childNode instanceof Text) {
          mutableSubtrees.set(
            positionnedChildrenCount,
            new Tree(childNode, this, positionnedChildrenCount)
          )
          positionnedChildrenCount += 1
        } else {
          const propertyName = childNode.getAttribute(this.keyAttribute)
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
      else if (this.tagName === Types.TyperTagName.NULL) { this.type = 'null' }
      else if (this.tagName === Types.TyperTagName.BOOLEAN) { this.type = 'boolean' }
      else if (this.tagName === Types.TyperTagName.NUMBER) { this.type = 'number' }
      else if (this.tagName === Types.TyperTagName.STRING) { this.type = 'string' }
      else if (this.tagName === Types.TyperTagName.TEXT) { this.type = 'text' }
      else if (this.tagName === Types.TyperTagName.NODELIST) { this.type = 'nodelist' }
      else if (this.tagName === Types.TyperTagName.ARRAY) { this.type = 'array' }
      else if (this.tagName === Types.TyperTagName.RECORD) { this.type = 'record' }
      else if (this.generators.get(this.tagName) !== undefined) { this.type = 'transformer' }
      else { this.type = 'element' }
    }
  
    resolve: Types.Resolver = function (this: Tree, path): Tree | undefined {
      let currentTree: Tree = this.root
      for (const chunk of path) {
        const { subtrees } = currentTree
        const foundSubtree = subtrees.get(chunk)
        if (foundSubtree === undefined) return undefined
        currentTree = foundSubtree
      }
      return currentTree
    }
  
    getGenerator (this: Tree, name: string) {
      return this.generators.get(name)
    }
  
    initValue (this: Tree<T>) {
      const { type } = this
      let currentValue: Types.Value
      if (type === 'null') { currentValue = null }
      else if (type === 'boolean') { currentValue = false }
      else if (type === 'number') { currentValue = 0 }
      else if (type === 'string') { currentValue = '' }
      else if (type === 'text') { currentValue = this.node.textContent }
      else if (type === 'element') { currentValue = getWindow().document.createDocumentFragment().childNodes as NodeListOf<Element | Text> }
      else if (type === 'nodelist') { currentValue = getWindow().document.createDocumentFragment().childNodes as NodeListOf<Element | Text> }
      else if (type === 'array') { currentValue = [] }
      else if (type === 'record') { currentValue = {} }
      else if (type === 'transformer') { currentValue = [] }
      else { currentValue = null } // normally type: never here
      return currentValue
    }
  
    getInnerValue (this: Tree<T>, initialValue: ReturnType<typeof this.initValue>): Types.Value {
      const { subtrees } = this
      const innerValue = Array
        .from(subtrees.entries())
        .reduce((currentValue, [subpath, subtree]) => mergeValues(
          currentValue,
          subtree.evaluate(),
          subpath,
          this
        ), initialValue as Types.Value)
      return innerValue
    }
  
    wrapInnerValue (this: Tree<T>, innerValue: Types.Value): Types.Value | Types.Transformer {
      const { type } = this
      if (type === 'transformer') {
        const transformerName = this.tagName
        if (transformerName === null) return innerValue
        const generator = this.getGenerator(transformerName)
        if (generator === undefined) return innerValue
        const transformer = Array.isArray(innerValue)
          ? generator(transformerName, ...innerValue)
          : generator(transformerName, innerValue)
        return transformer
      }
      if (type === 'null') return Cast.toNull()
      if (type === 'boolean') return Cast.toBoolean(innerValue)
      if (type === 'number') return Cast.toNumber(innerValue)
      if (type === 'string') return Cast.toString(innerValue)
      if (type === 'array') return Cast.toArray(innerValue)
      if (type === 'record') return Cast.toRecord(innerValue)
      if (type === 'text') return Cast.toText(innerValue)
      if (type === 'element') return Cast.toElement(innerValue)
      if (type === 'nodelist') return Cast.toNodeList(innerValue)
      return Cast.toNull()
    }
  
    private cache: Types.Serialized | undefined = undefined
    private setCache (this: Tree, value: Types.Value): void {
      this.cache = Serialize.serialize(value)
    }
  
    perfCounters = {
      computed: 0,
      computeTime: 0,
      computeTimeAvg: 0,
      cached: 0,
      cacheTime: 0,
      cacheTimeAvg: 0,
      totalTime: 0
    }
  
    getPerfCounters () {
      const { subtrees } = this
      const subCounters: Array<[string, typeof this['perfCounters']]> = []
      subCounters.push([this.pathString, this.perfCounters])
      subtrees.forEach(subtree => subCounters.push(...subtree.getPerfCounters()))
      return subCounters
    }
  
    printPerfCounters () {
      const perfCounters = this.getPerfCounters()
        .sort((a, b) => b[1].totalTime - a[1].totalTime)
        .map(e => ({
          path: e[0],
          totalMs: e[1].totalTime,
          computeMs: e[1].computeTime,
          cacheMs: e[1].cacheTime,
          ops: `${e[1].computed}/${e[1].cached}`
        }))
      console.table(perfCounters)
    }
  
    callstack: string[] = []
    pushToEvalCallStack (path: string) {
      this.callstack.push(path)
      this.parent?.pushToEvalCallStack(path)
    }
    flushEvalCallStack () { this.callstack.length = 0 }
  
    evaluate (this: Tree<T>): Types.Value {
      const start = Date.now()
      const circularPatternDetected = this.callstack.some(p => p.startsWith(this.pathString))
      if (circularPatternDetected) throw new Error(`Circular reference pattern detected @ ${this.pathString}`)
      this.pushToEvalCallStack(this.pathString)
      const { perfCounters, cache } = this
      if (cache !== undefined) {
        const deserialized = Serialize.deserialize(cache)
        const end = Date.now()
        const time = end - start
        perfCounters.cached ++
        perfCounters.cacheTime += time
        perfCounters.cacheTimeAvg = perfCounters.cacheTime / perfCounters.cached
        perfCounters.totalTime = perfCounters.computeTime + perfCounters.cacheTime
        return deserialized
      }
      const init = this.initValue()
      const inner = this.getInnerValue(init)
      const wrapped = this.wrapInnerValue(inner)
      this.setCache(wrapped)
      const end = Date.now()
      const time = end - start
      perfCounters.computed ++
      perfCounters.computeTime += time
      perfCounters.computeTimeAvg = perfCounters.computeTime / perfCounters.computed
      perfCounters.totalTime = perfCounters.computeTime + perfCounters.cacheTime
      this.flushEvalCallStack()
      return wrapped
    }
  }
}
