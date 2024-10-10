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
  
  export enum TransformerTagName {
    MAP = 'map',
    REF = 'ref',
    ADD = 'add',
    MULT = 'mult',
    APPEND = 'append'
  }
  
  export type PrimitiveValue = null | string | number | boolean | Element | Text | NodeListOf<Text | Element> | Transformer
  export type Value = PrimitiveValue | Value[] | { [k: string]: Value }
  export type Transformer = (currentValue: Value, hooks: {
    merger: Tree['mergeValues']
    resolver: Tree['resolve']
  }) => Value
  export type TransformerGenerator = (path: string | number, ...args: Value[]) => Transformer

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
