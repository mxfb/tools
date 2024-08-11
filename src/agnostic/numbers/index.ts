import { absoluteModulo as absoluteModuloFunc } from './absolute-modulo'
import { clamp as clampFunc } from './clamp'
import { interpolate as interpolateFunc } from './interpolate'
import {
  getHarmonic as getHarmonicFunc,
  createScale as createScaleFunc
} from './responsive-harmonics'
import { round as roundFunc } from './round'

export namespace Numbers {
  // Absolute modulo
  export const absoluteModulo = absoluteModuloFunc
  // Clamp
  export const clamp = clampFunc
  // Interpolate
  export const interpolate = interpolateFunc
  // Responsive harmonics [WIP] rename, rewrite, move relevant stuff to Css
  export const getHarmonic = getHarmonicFunc
  export const createScale = createScaleFunc
  // Round
  export const round = roundFunc
}
