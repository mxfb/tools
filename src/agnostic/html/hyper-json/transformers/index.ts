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
    ['append'.toLowerCase(), append],
    ['classList'.toLowerCase(), classList],
    ['join'.toLowerCase(), join],
    ['length'.toLowerCase(), length],
    ['print'.toLowerCase(), print],
    ['push'.toLowerCase(), push],
    ['querySelector'.toLowerCase(), querySelector],
    ['ref'.toLowerCase(), ref],
    ['replace'.toLowerCase(), replace],
    ['split'.toLowerCase(), split],
    ['toArray'.toLowerCase(), toArray],
    ['toBoolean'.toLowerCase(), toBoolean],
    ['toElement'.toLowerCase(), toElement],
    ['toNodeList'.toLowerCase(), toNodeList],
    ['toNull'.toLowerCase(), toNull],
    ['toNumber'.toLowerCase(), toNumber],
    ['toRecord'.toLowerCase(), toRecord],
    ['toRef'.toLowerCase(), toRef],
    ['toString'.toLowerCase(), toString],
    ['toText'.toLowerCase(), toText],
    ['toTransformer'.toLowerCase(), toTransformer],
    ['transformSelected'.toLowerCase(), transformSelected],
    ['trim'.toLowerCase(), trim]
  ])
}
