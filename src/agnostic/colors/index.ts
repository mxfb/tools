import { complementColor as complementColorFunc} from './complement-color'
import { HEXToRGB as HEXToRGBFunc } from './hex-to-rgb'
import { RGBToHEX as RGBToHEXFunc } from './rgb-to-hex'
import { RGBToHSL as RGBToHSLFunc } from './rgb-to-hsl'
import { HSLToRGB as HSLToRGBFunc } from './hsl-to-rgb'
import { lightenColor as lightenColorFunc } from './lighten-color'
import { saturateColor as saturateColorFunc } from './saturate-color'

export namespace Colors {
  export const complementColor = complementColorFunc
  export const HEXToRGB = HEXToRGBFunc
  export const RGBToHEX = RGBToHEXFunc
  export const RGBToHSL = RGBToHSLFunc
  export const HSLToRGB = HSLToRGBFunc
  export const lightenColor = lightenColorFunc
  export const saturateColor = saturateColorFunc
}
