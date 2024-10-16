import { Types } from '../types'
import { append } from './append'
import { classList } from './classList'
import { join } from './join'
import { length } from './length'
import { print } from './print'
import { push } from './push'
import { querySelector } from './querySelector'
import { ref } from './ref'
import { replace } from './replace'
import { split } from './split'
import { toArray } from './toArray'
import { toBoolean } from './toBoolean'
import { toElement } from './toElement'
import { toNodeList } from './toNodeList'
import { toNull } from './toNull'
import { toNumber } from './toNumber'
import { toRecord } from './toRecord'
import { toRef } from './toRef'
import { toString } from './toString'
import { toText } from './toText'
import { toTransformer } from './toTransformer'
import { transformSelected } from './transformSelected'
import { trim } from './trim'

export namespace Transformers {
  export const defaultGeneratorsMap = new Map<string, Types.TransformerGenerator>([
    ['append', append],
    ['classList', classList],
    ['join', join],
    ['length', length],
    ['print', print],
    ['push', push],
    ['querySelector', querySelector],
    ['ref', ref],
    ['replace', replace],
    ['split', split],
    ['toArray', toArray],
    ['toBoolean', toBoolean],
    ['toElement', toElement],
    ['toNodeList', toNodeList],
    ['toNull', toNull],
    ['toNumber', toNumber],
    ['toRecord', toRecord],
    ['toRef', toRef],
    ['toString', toString],
    ['toText', toText],
    ['toTransformer', toTransformer],
    ['transformSelected', transformSelected],
    ['trim', trim]
  ])
}
