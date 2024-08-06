import { absoluteModulo as absoluteModuloFunc } from './absolute-modulo'
import { clamp as clampFunc } from './clamp'
import { interpolate as interpolateFunc } from './interpolate'
import { round as roundFunc } from './round'

export namespace Numbers {
  export const absoluteModulo = absoluteModuloFunc
  export const clamp = clampFunc
  export const interpolate = interpolateFunc
  export const round = roundFunc
}
