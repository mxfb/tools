import zod from 'zod'
import sharp from 'sharp'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'

import { areaCompositionSchema, AreaCompositionOperation } from './area-composition'
import { blurSchema, BlurOperation } from './blur'
import { brightnessSchema, BrightnessOperation } from './brightness'
import { compositeSchema, CompositeOperation } from './composite'
import { extendSchema, ExtendOperation } from './extend'
import { extractSchema, ExtractOperation } from './extract'
import { flattenSchema, FlattenOperation } from './flatten'
import { flipSchema, FlipOperation } from './flip'
import { flopSchema, FlopOperation } from './flop'
import { hueSchema, HueOperation } from './hue'
import { innerResizeSchema, InnerResizeOperation } from './inner-resize'
import { lightnessSchema, LightnessOperation } from './lightness'
import { linearSchema, LinearOperation } from './linear'
import { modulateSchema, ModulateOperation } from './modulate'
import { normalizeSchema, NormalizeOperation } from './normalize'
import { rotateSchema, RotateOperation } from './rotate'
import { resizeSchema, ResizeOperation } from './resize'
import { saturationSchema, SaturationOperation } from './saturation'

import { areaCompose } from './_utils/area-composition'
import { innerResize } from './_utils/inner-resize'

/* Utilities */

export type Color = string | {
  r: number
  g: number
  b: number
}

export const colorSchema: zod.ZodType<Color> =  (zod.string().min(7).max(7)).or(zod.object({
  r: zod.number().min(0).max(255),
  g: zod.number().min(0).max(255),
  b: zod.number().min(0).max(255),
}))

/* Operations */

export const OperationNames = {
  Rotate: 'rotate',
  Resize: 'resize',
  InnerResize: 'inner-resize',
  Extract: 'extract',
  Extend: 'extend',
  AreaComposition: 'area-composition',
  Composite: 'composite',
  Flop: 'flop',
  Flip: 'flip',
  Blur: 'blur',
  Flatten: 'flatten',
  Normalize: 'normalize',
  Brightness: 'brightness',
  Saturation: 'saturation',
  Hue: 'hue',
  Lightness: 'lightness',
  Modulate: 'modulate',
  Linear: 'linear'
} as const

export type Operation =
  AreaCompositionOperation
  | BlurOperation
  | BrightnessOperation
  | CompositeOperation
  | ExtendOperation
  | ExtractOperation
  | FlattenOperation
  | FlipOperation
  | FlopOperation
  | HueOperation
  | InnerResizeOperation
  | LightnessOperation
  | LinearOperation
  | ModulateOperation
  | NormalizeOperation
  | ResizeOperation
  | SaturationOperation
  | RotateOperation

const operationSchema = zod.union([
  areaCompositionSchema,
  blurSchema,
  brightnessSchema,
  compositeSchema,
  extendSchema,
  extractSchema,
  flattenSchema,
  flipSchema,
  flopSchema,
  hueSchema,
  innerResizeSchema,
  lightnessSchema,
  linearSchema,
  modulateSchema,
  normalizeSchema,
  resizeSchema,
  rotateSchema,
  saturationSchema
])

export function isOperation (operation: unknown): Outcome.Either<Operation, string> {
  try {
    const parsed = operationSchema.parse(operation)
    return Outcome.makeSuccess(parsed)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}

export type Transformation = {
  width: number
  height: number
  x: number
  y: number
}

export async function applyOperation (
  sharpInstance: sharp.Sharp,
  operation: Operation,
  transformation: Transformation
): Promise<{
  sharp: sharp.Sharp,
  transformation?: Partial<Transformation>
}> {
  const imageMetadata = await sharpInstance.metadata()
  const imageDimensions = {
    width: imageMetadata.width || 0,
    height: imageMetadata.height || 0,
  }

  switch(operation.name) {
    case OperationNames.Rotate:
      return { sharp: sharpInstance.rotate(operation.params.angle)}
    case OperationNames.InnerResize:
      return innerResize(sharpInstance, operation.params)
    case OperationNames.Resize:
      return { sharp: sharpInstance
        .resize({
          width: operation.params.width,
          height: operation.params.height,
          fit: operation.params.fit || 'cover',
          background: {r: 255, g: 255, b: 255, alpha: 0}
        })} /* Adds a transparent background (necessary for png) */
    case OperationNames.AreaComposition:
      const composedImage = await areaCompose(sharpInstance, {
        innerTransformation: {
          w: transformation.width,
          h: transformation.height,
          x: transformation.x,
          y: transformation.y
        },
        ...operation.params,
      })
      return { sharp: composedImage }
    case OperationNames.Extract:
      return { sharp: sharp(await sharpInstance.extract({ 
        left: operation.params.left,
        top: operation.params.top, 
        width: operation.params.width, 
        height: operation.params.height,
      }).toBuffer()) }
    case OperationNames.Extend:
      return { sharp: sharpInstance.extend({ 
        left: operation.params.left,
        top: operation.params.top, 
        right: operation.params.right, 
        bottom: operation.params.bottom,
        background: operation.params.background,
        extendWith: operation.params.extendWith || 'mirror'
      }) }
    case OperationNames.Flip:
      return { sharp: sharpInstance.flip(operation.params.flip)}
    case OperationNames.Flop:
      return { sharp: sharpInstance.flop(operation.params.flop)}
    case OperationNames.Blur:
      return { sharp: sharpInstance.blur(operation.params.sigma)}
    case OperationNames.Flatten:
      return { sharp: sharpInstance.flatten({
        background: operation.params.background
      })}
    case OperationNames.Normalize:
      return { sharp: sharpInstance.normalize({
        lower: operation.params.lower,
        upper: operation.params.upper
      })}
    case OperationNames.Brightness:
      return { sharp: sharpInstance.modulate({
        brightness: operation.params.brightness
      })}
    case OperationNames.Saturation:
      return { sharp: sharpInstance.modulate({
        saturation: operation.params.saturation
      })}
    case OperationNames.Hue:
      return { sharp: sharpInstance.modulate({
        hue: operation.params.hue
      })}
    case OperationNames.Lightness:
      return { sharp: sharpInstance.modulate({
        lightness: operation.params.lightness
      })}
    case OperationNames.Modulate:
      return { sharp: sharpInstance.modulate({
        lightness: operation.params.lightness,
        brightness: operation.params.brightness,
        hue: operation.params.hue,
        saturation: operation.params.saturation,
      })}
    case OperationNames.Linear:
      return { sharp: sharpInstance.linear(operation.params.multiplier, operation.params.offset)}
    case OperationNames.Composite:
       const newComposedSharp = sharp({
        create: {
          background: { r: 255, g: 255, b: 255, alpha: 0 },
          width: imageDimensions.width,
          height:  imageDimensions.height,
          channels: 4,
        }
      }).toFormat('png').composite([
        {
          input:  await sharpInstance.toFormat('png').toBuffer(),
          left: 0,
          top: 0
        },
        ...operation.params.images.map((image) => {
          if ('overlay' in image.input) {
            switch(image.input.overlay.mode) {
              case 'fill':
                return {
                  ...image,
                  input: {
                    create: {
                      background: image.input.overlay.background,
                      channels: image.input.overlay.channels || 4,
                      width: image.input.overlay.width || imageDimensions.width,
                      height: image.input.overlay.height || imageDimensions.height,
                    }
                  }
                }
              case 'gradient':
                return {
                  left: 0,
                  top: 0,
                  ...image,
                  input: Buffer.from(`<svg viewBox="0 0 ${imageDimensions.width} ${imageDimensions.height}" xmlns="http://www.w3.org/2000/svg"  xmlns:xlink="http://www.w3.org/1999/xlink" width="${imageDimensions.width}" height="${imageDimensions.height}">
                    <defs>
                      <linearGradient id="myGradient" gradientTransform="rotate(${image.input.overlay.angle})">
                      ${image.input.overlay.stops.map((stop) => `<stop offset="${stop.offset}%" stop-color="${stop.color}" />`).join(' ')}
                      </linearGradient>
                    </defs>
                    <rect  x="0" y="0" width="100%" height="100%" fill="url('#myGradient')"></rect>
                  </svg>`
                  )
                }
            }
          } 
          return {
            ...image,
            input: image.input
          }
        })
      ]).toFormat('png').flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
      const imageMetadata = await newComposedSharp.metadata()
      return { 
        sharp: newComposedSharp, 
        transformation: {
          width: imageMetadata.width || 0,
          height: imageMetadata.height || 0,
          x: 0,
          y: 0
        },
      }
    default:
      return { sharp: sharpInstance }
  }
}