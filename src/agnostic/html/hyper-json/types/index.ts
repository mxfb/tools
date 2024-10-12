import { Tree } from '../tree'

export namespace Types {
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
  
  export type PrimitiveValue = null | string | number | boolean | Element | Text | NodeListOf<Text | Element> | Transformer
  export type Value = PrimitiveValue | Value[] | { [k: string]: Value }
  export type TransformerHooks = {
    resolver: Tree['resolve']
    getGenerator: Tree['getGenerator']
  }
  export type TransformerErrorReturnType = { action: 'ERROR', value: Value }
  export type TransformerReplaceReturnType = { action: 'REPLACE', value: Value }
  export type TransformerMergeReturnType = { action: 'MERGE', value: Value }
  export type TransformerNullReturnType = { action: null }
  export type TransformerReturnType = TransformerErrorReturnType
    | TransformerReplaceReturnType
    | TransformerMergeReturnType
    | TransformerNullReturnType

  export type AnonymousTransformer = (currentValue: Value, callerTree: Tree) => TransformerReturnType
  export type Transformer = AnonymousTransformer & { transformerName: string }
  export type TransformerGenerator = (name: string, ...args: Value[]) => Transformer

  export type Serialized = { type: 'null', value: null }
    | { type: 'boolean', value: boolean }
    | { type: 'number', value: number }
    | { type: 'string', value: string }
    | { type: 'text', value: string }
    | { type: 'element', value: string }
    | { type: 'nodelist', value: string }
    | { type: 'array', value: Array<Serialized> }
    | { type: 'record', value: { [k: string]: Serialized } }
    | { type: 'transformer', value: Transformer }
}
