import sharp from 'sharp'
import zod from 'zod'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'
import { areaCompose, AreaCompositionParams } from './_utils/area-composition'
import { innerResize, InnerResizeParams } from './_utils/inner-resize'






import { rotateSchema, RotateOperation } from './rotate'




/* Utilities */

export type Color = string | {
  r: number,
  g: number,
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

// Resize


// Inner resize


// Extract (Crop)


// Extend 
export type ExtendOperationParams = {
  left: number,
  right: number
  top: number,
  bottom: number,
  extendWith?: sharp.ExtendWith,
  background?: { r: number, g: number, b: number } | string
}

export type ExtendOperation = {
  name: typeof OperationNames.Extend,
  params: ExtendOperationParams
}

export const extendSchema: zod.ZodType<ExtendOperation> = zod.object({
  name: zod.literal(OperationNames.Extend),
  params: zod.object({
    top: zod.number(),
    left: zod.number(),
    right: zod.number(),
    bottom: zod.number(),
    background: zod.optional(colorSchema),
    extendWith: zod.optional(zod.enum([
      'background',
      'copy',
      'repeat',
      'mirror'
    ]))
  })
})

// Area-composition
export type AreaCompositionOperationParams = Partial<AreaCompositionParams>

export type AreaCompositionOperation = {
  name: typeof OperationNames.AreaComposition,
  params: AreaCompositionOperationParams
}

// [WIP] le schéma ne matche pas le type
export const areaCompositionSchema: zod.ZodType<AreaCompositionOperation> = zod.object({
  name: zod.literal(OperationNames.AreaComposition),
  params: zod.object({
    innerTransformation: zod.optional(zod.object({
      w: zod.number(),
      h: zod.number(),
      x: zod.number(),
      y: zod.number()
    })),
    palette: zod.optional(zod.object({
      additionalColors: zod.optional(zod.array(zod.array(zod.number()).length(3))),
      createFrom: zod.optional(zod.array(zod.enum([
        'default',
        'default-lighten',
        'default-saturate',
        'complementary',
        'complementary-lighten',
        'complementary-saturate'
      ]))),
      maxDensity: zod.optional(zod.number()),
      useAdditionalColorsOnly: zod.optional(zod.boolean()),
      useExtractFromInner: zod.optional(zod.boolean()),
      extractDensity: zod.optional(zod.number()),
      lightenIntensity: zod.optional(zod.number()),
      saturateIntensity: zod.optional(zod.number()),
    })),
    composition: zod.union([
      zod.object({
        type: zod.literal('tile'),
        params: zod.optional(zod.object({
          coverage: zod.optional(zod.number().min(0).max(100)),
          densityA: zod.optional(zod.object({min: zod.number(), max: zod.number()})),
          densityB: zod.optional(zod.object({min: zod.number(), max: zod.number()})),
          format: zod.optional(zod.enum([
            'random',
            'default',
            'portrait',
            'landscape'
          ])),
          xEasing: zod.optional(zod.string()),
          yEasing: zod.optional(zod.string()),
        }))
      }),
      zod.object({
        type: zod.literal('line'),
        params: zod.optional(zod.object({
          nbLines: zod.optional(zod.number().min(0).max(20)),
          colors: zod.optional(zod.object({
            base: zod.enum(['first', 'last']).or(zod.number()),
            primary: zod.array(zod.object({
              type: zod.enum([
                'saturate',
                'lighten',
                'complement'
              ]),
              intensity: zod.number(),
              intensityMode: zod.enum(['add', 'set'])
            })),
            secondary: zod.array(zod.object({
              type: zod.enum([
                'saturate',
                'lighten',
                'complement'
              ]),
              intensity: zod.number(),
              intensityMode: zod.enum(['add', 'set'])
            })),
          }))
        }))
      }),
    ])
  })
})

// Flip
export type FlipOperationParams = {
  flip?: boolean
} 

export type FlipOperation = {
  name: typeof OperationNames.Flip,
  params: FlipOperationParams
}

export const flipSchema: zod.ZodType<FlipOperation> = zod.object({
  name: zod.literal(OperationNames.Flip),
  params: zod.object({
    flip: zod.boolean().optional()
  })
})

// Flop
export type FlopOperationParams = {
  flop?: boolean
}

export type FlopOperation = {
  name: typeof OperationNames.Flop,
  params: FlopOperationParams
}

export const flopSchema: zod.ZodType<FlopOperation> = zod.object({
  name: zod.literal(OperationNames.Flop),
  params: zod.object({
    flop: zod.boolean().optional()
  })
})

// Blur
export type BlurOperationParams = {
  sigma: number
}

export type BlurOperation = {
  name: typeof OperationNames.Blur,
  params: BlurOperationParams
}

export const blurSchema: zod.ZodType<BlurOperation> = zod.object({
  name: zod.literal(OperationNames.Blur),
  params: zod.object({
    sigma: zod.number()
  })
})

// Flatten (Add Background)
export type FlattenOperationParams = {
  background: string | {
    r: number
    g: number
    b: number
  }
}

export type FlattenOperation = {
  name: typeof OperationNames.Flatten,
  params: FlattenOperationParams
}

export const flattenSchema: zod.ZodType<FlattenOperation> = zod.object({
  name: zod.literal(OperationNames.Flatten),
  params: zod.object({
    background: colorSchema
  })
})

// Normalize (Enhance constrasts)
export type NormalizeOperationParams = {
  lower: number
  upper: number
}

export type NormalizeOperation = {
  name: typeof OperationNames.Normalize,
  params: NormalizeOperationParams
}

// [WIP] manque le schéma
export const normalizeSchema: zod.ZodType<NormalizeOperation> = zod.object({})

// Brightness
export type BrightnessOperationParams = {
  brightness: number 
}

export type BrightnessOperation = {
  name: typeof OperationNames.Brightness,
  params: BrightnessOperationParams
}

export const brightnessSchema: zod.ZodType<BrightnessOperation> = zod.object({
  name: zod.literal(OperationNames.Brightness),
  params: zod.object({
    brightness: zod.number().min(0)
  })
})

// Saturation
export type SaturationOperationParams = {
  saturation: number 
}

export type SaturationOperation = {
  name: typeof OperationNames.Saturation,
  params: SaturationOperationParams
}

export const saturationSchema: zod.ZodType<SaturationOperation> = zod.object({
  name: zod.literal(OperationNames.Saturation),
  params: zod.object({
     saturation: zod.number().min(0)
  })
})

// Hue
export type HueOperationParams = {
  hue: number 
}

export type HueOperation = {
  name: typeof OperationNames.Hue,
  params: HueOperationParams
}

export const hueSchema: zod.ZodType<HueOperation> = zod.object({
  name: zod.literal(OperationNames.Hue),
  params: zod.object({
    hue: zod.number().min(0)
  })
})

// Lightness
export type LightnessOperationParams = {
  lightness: number 
}

export type LightnessOperation = {
  name: typeof OperationNames.Lightness,
  params: LightnessOperationParams
}

export const lightnessSchema: zod.ZodType<LightnessOperation> = zod.object({
  name: zod.literal(OperationNames.Lightness),
  params: zod.object({
    lightness: zod.number().min(0)
  })
})

// Modulate
export type ModulateOperationParams = {
  brightness?: number 
  lightness?: number 
  hue?: number 
  saturation?: number 
}

export type ModulateOperation = {
  name: typeof OperationNames.Modulate,
  params: ModulateOperationParams
}

export const modulateSchema: zod.ZodType<ModulateOperation> = zod.object({
  name: zod.literal(OperationNames.Modulate),
  params: zod.object({
    lightness: zod.optional(zod.number().min(0)),
    brightness: zod.optional(zod.number().min(0)),
    saturation: zod.optional(zod.number().min(0)),
    hue: zod.optional(zod.number().min(0))
  })
})

// Linear (Applies multiplier to RGB values)
export type LinearOperationParams = {
  multiplier: number | [number, number, number]
  offset?: number | [number, number, number]
}

export type LinearOperation = {
  name: typeof OperationNames.Linear,
  params: LinearOperationParams
}

// [WIP] le schéma ne matche pas le type
export const linearSchema: zod.ZodType<LinearOperation> = zod.object({
  name: zod.literal(OperationNames.Linear),
  params: zod.object({
    multiplier: zod.optional(zod.number()).or(zod.array(zod.number()).length(3)),
    offset: zod.optional(zod.number()).or(zod.array(zod.number()).length(3))
  })
})

// Composite (Add Layers to image)
export type CompositeOverlayFillOperationParams = {
  mode: 'fill',
  channels?: sharp.Create['channels'],
  background: sharp.Create['background'] 
}

export type CompositeOverlayGradientOperationParams = {
  mode: 'gradient',
  angle: number,
  stops: { color: string, offset: number }[]
}

export type CompositeOperationParams = {
  images: {
    input: Buffer | { overlay: {
      width?: sharp.Create['width'],
      height?: sharp.Create['height']
    } & (CompositeOverlayFillOperationParams | CompositeOverlayGradientOperationParams)},
    blend: sharp.Blend,
    gravity: sharp.Gravity,
    top?: number,
    left?: number,
    tile?: boolean
  }[]
}

export type CompositeOperation = {
  name: typeof OperationNames.Composite,
  params: CompositeOperationParams
}

// [WIP] le schéma ne matche pas le type
// + question : est-ce que c'est pas deux opérations différentes en fait ? Vraie question, j'ai pas investigué
export const compositeSchema: zod.ZodType<CompositeOperation> = zod.object({
  name: zod.literal(OperationNames.Composite),
  params: zod.object({
    images: zod.array(zod.object({
      input: zod.custom(val => {
        return Buffer.isBuffer(val)
      }).or(zod.object({
        overlay: zod.union([
          zod.object({
            mode: zod.literal('fill'),
            background: colorSchema,
            channels: zod.optional(zod.literal(3).or(zod.literal(4))),
            width: zod.optional(zod.number()),
            height: zod.optional(zod.number())
          }),
          zod.object({
            mode: zod.literal('gradient'),
            width: zod.optional(zod.number()),
            height: zod.optional(zod.number()),
            stops: zod.array(
              zod.object({
                color: zod.string(),
                offset: zod.number().min(0).max(100)
              })
            )
          })
        ])
      })),
      blend: zod.enum([
        'clear',
        'source',
        'over',
        'in',
        'out',
        'atop',
        'dest',
        'dest-over',
        'dest-in',
        'dest-out',
        'dest-atop',
        'xor',
        'add',
        'saturate',
        'multiply',
        'screen',
        'overlay',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion'
      ]),
      gravity: zod.number().or(zod.enum([
        'north',
        'northeast',
        'southeast',
        'south',
        'southwest',
        'west',
        'northwest',
        'east',
        'center',
        'centre'
      ])),
      top: zod.optional(zod.number()),
      left: zod.optional(zod.number()),
      tile: zod.optional(zod.boolean())
    }))
  }) /* @todo */ // [WIP] reminder de ton @todo : D
})

// Operations

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

export type Operations = Operation[]

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
  width: number,
  height: number,
  x: number,
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