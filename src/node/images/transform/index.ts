import zod from 'zod'
import sharp, { Color } from 'sharp'
import { Outcome } from '../../../agnostic/misc/outcome'
import { unknownToString } from '../../../agnostic/errors/unknown-to-string'
import { OperationNames } from './_utils/operation-names'

import { blurSchema, BlurOperation } from './blur'
import { brightnessSchema, BrightnessOperation } from './brighten'
import { composeSchema, ComposeOperation } from './compose'
import { extendSchema, ExtendOperation } from './extend'
import { extractSchema, ExtractOperation } from './extract'
import { flattenSchema, FlattenOperation } from './flatten'
import { flipSchema, FlipOperation } from './flip'
import { flopSchema, FlopOperation } from './flop'
import { hueSchema, HueOperation } from './hue'
import { lightnessSchema, LightnessOperation } from './lighten'
import { linearSchema, LinearOperation } from './linear'
import { modulateSchema, ModulateOperation } from './modulate'
import { normalizeSchema, NormalizeOperation } from './normalize'
import { resizeSchema, ResizeOperation } from './resize'
import { rotateSchema, RotateOperation } from './rotate'
import { saturationSchema, SaturationOperation } from './saturation'
import { scaleSchema, ScaleOperation } from './scale'
import { frameSchema, FrameOperation } from './frame'

import { scale } from './operations/_utils/scale'
import { frame } from './operations/_utils/frame'
import { compose } from './operations/_utils/compose'

export type Operation = 
  | BlurOperation
  | BrightnessOperation
  | ComposeOperation
  | ExtendOperation
  | ExtractOperation
  | FlattenOperation
  | FlipOperation
  | FlopOperation
  | FrameOperation
  | HueOperation
  | LightnessOperation
  | LinearOperation
  | ModulateOperation
  | NormalizeOperation
  | ResizeOperation
  | RotateOperation
  | SaturationOperation
  | ScaleOperation;
  
const operationSchema = zod.union([
  // areaComposeSchema,
  blurSchema,
  brightnessSchema,
  composeSchema,
  extendSchema,
  extractSchema,
  flattenSchema,
  flipSchema,
  flopSchema,
  frameSchema,
  hueSchema,
  lightnessSchema,
  linearSchema,
  modulateSchema,
  normalizeSchema,
  resizeSchema,
  rotateSchema,
  saturationSchema,
  scaleSchema
])

export function isOperation (operation: unknown): Outcome.Either<Operation, string> {
  try { return Outcome.makeSuccess(operationSchema.parse(operation)) }
  catch (err) { return Outcome.makeFailure(unknownToString(err)) }
}

export async function transform (
  imageBuffer: Buffer,
  operations: Operation[],
  checkValidOperations?: boolean // Temp
): Promise<Buffer> {
  let sharpInstance = sharp(imageBuffer)
  const needsValidation = checkValidOperations ?? false
  for (const operation of operations) {
    const _isOperation = isOperation(operation);
    if (!needsValidation || _isOperation.success) {
      console.log('Images:Transform:Operation:Start', operation.name);
        // [WIP] sharpInstance should be mutated on every stage
        // so no real need to reassign, but just in case some
        // operation function tries to clone the input and return
        // an other instance...
        sharpInstance = await apply(sharpInstance, operation)
  
      console.log('Images:Transform:Operation:Done', operation.name);
    }
  }
  return sharpInstance.toBuffer()
}


/* Utilities */

/* Operations */

export async function apply (
  sharpInstance: sharp.Sharp,
  operation: Operation
): Promise<sharp.Sharp> {
  switch(operation.name) {
    case OperationNames.Blur: return sharpInstance.blur(operation.params.sigma)
    case OperationNames.Brightness: return sharpInstance.blur(operation.params.brightness)
    case OperationNames.Compose: return compose(sharpInstance, operation.params)
    case OperationNames.Extend: return sharpInstance.extend(operation.params)
    case OperationNames.Extract: return sharpInstance.extract(operation.params)
    case OperationNames.Flip: return sharpInstance.flip(operation.params.flip)
    case OperationNames.Flop: return sharpInstance.flop(operation.params.flop)
    case OperationNames.Frame: return frame(sharpInstance, operation.params);
    case OperationNames.Flatten: return sharpInstance.flatten(operation.params)
    case OperationNames.Hue: return sharpInstance.modulate(operation.params)
    case OperationNames.Lightness: return sharpInstance.modulate(operation.params)
    case OperationNames.Linear: return sharpInstance.linear(operation.params.multiplier, operation.params.offset)
    case OperationNames.Modulate: return sharpInstance.modulate(operation.params)
    case OperationNames.Normalize: return sharpInstance.normalize(operation.params)
    case OperationNames.Resize: return sharpInstance.resize(operation.params)
    case OperationNames.Rotate: return sharpInstance.rotate(operation.params.angle)
    case OperationNames.Saturation: return sharpInstance.modulate(operation.params)
    case OperationNames.Scale: return scale(sharpInstance, operation.params)
    default: return sharpInstance 
  }
}