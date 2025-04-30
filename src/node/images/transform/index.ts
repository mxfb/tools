import zod from 'zod'
import sharp, { Color } from 'sharp'
import { Outcome } from '../../../agnostic/misc/outcome'
import { unknownToString } from '../../../agnostic/errors/unknown-to-string'

import { areaComposeSchema, AreaComposeOperation } from './area-compose'
import { blurSchema, BlurOperation } from './blur'
import { brightnessSchema, BrightnessOperation } from './brighten'
import { compositeSchema, CompositeOperation } from './composite'
import { extendSchema, ExtendOperation } from './extend'
import { extractSchema, ExtractOperation } from './extract'
import { flattenSchema, FlattenOperation } from './flatten'
import { flipSchema, FlipOperation } from './flip'
import { flopSchema, FlopOperation } from './flop'
import { hueSchema, HueOperation } from './hue'
import { innerResizeSchema, InnerResizeOperation } from './inner-resize'
import { lightnessSchema, LightnessOperation } from './lighten'
import { linearSchema, LinearOperation } from './linear'
import { modulateSchema, ModulateOperation } from './modulate'
import { normalizeSchema, NormalizeOperation } from './normalize'
import { resizeSchema, ResizeOperation } from './resize'
import { rotateSchema, RotateOperation } from './rotate'
import { saturationSchema, SaturationOperation } from './saturation'

import { areaCompose } from './operations/_utils/area-composition'
import { innerResize } from './operations/_utils/inner-resize'

export const OperationNames = {
  Rotate: 'rotate',
  Resize: 'resize',
  InnerResize: 'inner-resize',
  Extract: 'extract',
  Extend: 'extend',
  AreaComposition: 'area-compose',
  Composite: 'composite',
  Flop: 'flop',
  Flip: 'flip',
  Blur: 'blur',
  Flatten: 'flatten',
  Normalize: 'normalize',
  Brightness: 'brighten',
  Saturation: 'saturate',
  Hue: 'hue',
  Lightness: 'lighten',
  Modulate: 'modulate',
  Linear: 'linear'
} as const

export type Operation =
  AreaComposeOperation
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
  areaComposeSchema,
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
  try { return Outcome.makeSuccess(operationSchema.parse(operation)) }
  catch (err) { return Outcome.makeFailure(unknownToString(err)) }
}

export async function transform (
  imageBuffer: Buffer,
  operations: Operation[]
): Promise<Buffer> {
  let sharpInstance = sharp(imageBuffer)
  for (const operation of operations) {
    // [WIP] sharpInstance should be mutated on every stage
    // so no real need to reassign, but just in case some
    // operation function tries to clone the input and return
    // an other instance...
    sharpInstance = await apply(sharpInstance, operation)
  }
  return sharpInstance.toBuffer()
}


/* Utilities */

export const colorSchema: zod.ZodType<Color> = zod.object({
    r: zod.number().min(0).max(255),
    g: zod.number().min(0).max(255),
    b: zod.number().min(0).max(255),
    alpha: zod.number().min(0).max(1),
  }).or(zod.string().length(7))

/* Operations */

export async function apply (
  sharpInstance: sharp.Sharp,
  operation: Operation
): Promise<sharp.Sharp> {
  const imageMetadata = await sharpInstance.metadata()
  const imageDimensions = {
    width: imageMetadata.width || 0,
    height: imageMetadata.height || 0,
  }

  sharpInstance.modulate()
  switch(operation.name) {
    case OperationNames.Rotate: return sharpInstance.rotate(operation.params.angle)
    case OperationNames.InnerResize: return innerResize(sharpInstance, operation.params)
    case OperationNames.Resize: sharpInstance.resize({
      ...operation.params,
      options: {
        background: 'rgba(0, 0, 0, 0)',
        ...operation.params.options,
      }
    })
    case OperationNames.AreaComposition: return await areaCompose(sharpInstance, {
      innerTransformation: {
        w: transformation.width,
        h: transformation.height,
        x: transformation.x,
        y: transformation.y,
      },
      ...operation.params
    })
    case OperationNames.Extract: return sharpInstance.extract(operation.params)
    case OperationNames.Extend: return sharpInstance.extend(operation.params)
    case OperationNames.Flip: return sharpInstance.flip(operation.params.flip)
    case OperationNames.Flop: return sharpInstance.flop(operation.params.flop)
    case OperationNames.Blur: return sharpInstance.blur(operation.params.sigma)
    case OperationNames.Flatten: return sharpInstance.flatten(operation.params)
    case OperationNames.Normalize: return sharpInstance.normalize(operation.params)
    case OperationNames.Brightness: return sharpInstance.modulate(operation.params)
    case OperationNames.Saturation: return sharpInstance.modulate(operation.params)
    case OperationNames.Hue: return sharpInstance.modulate(operation.params)
    case OperationNames.Lightness: return sharpInstance.modulate(operation.params)
    case OperationNames.Modulate: return sharpInstance.modulate(operation.params)
    case OperationNames.Linear: return sharpInstance.linear(operation.params.multiplier, operation.params.offset)
    case OperationNames.Composite:
       // [WIP] rename to a verb (or two verbs if split into 2 funcs ?)
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
      ]).toFormat('png').flatten({
        background: {
          r: 255,
          g: 255,
          b: 255,
          alpha: 0
        }
      })
      return newComposedSharp
    default: return sharpInstance 
  }
}