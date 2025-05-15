import zod from 'zod'
import sharp from 'sharp'
import { colorSchema } from '../_utils/color-schema'
import { OperationNames } from '../_utils/operation-names'

export type CreateCompositionFillOperationParams = {
  mode: 'fill',
  nbChannels?: sharp.Create['channels'],
  background: sharp.Create['background'] 
}

export type CreateCompositionGradientOperationParams = {
  mode: 'gradient',
  angleDeg: number,
  colorStops: { color: string, offsetPercent: number }[]
}

type CreateCompositionImage = {
  widthPx?: sharp.Create['width'],
  heightPx?: sharp.Create['height'],
} & (
  CreateCompositionFillOperationParams | 
  CreateCompositionGradientOperationParams
)

type CompositionImage = Buffer | CreateCompositionImage;

export type ComposeOperationParams = {
  background?: sharp.Color,
  images: {
    input: CompositionImage,
    gravity: sharp.Gravity,
    blend?: sharp.Blend,
    top?: number,
    left?: number,
    tile?: boolean,
  }[]
}

export type ComposeOperation = {
  name: typeof OperationNames.Compose,
  params: ComposeOperationParams
}

// @todo: [WIP] + question : est-ce que c'est pas deux opérations différentes en fait ? Vraie question, j'ai pas investigué
export const composeSchema: zod.ZodType<ComposeOperation> = zod.object({
  name: zod.literal(OperationNames.Compose),
  params: zod.object({
    background: zod.optional(colorSchema),
    images: zod.array(
      zod.object({
        input: zod.union([
          zod.custom<Buffer>(val => Buffer.isBuffer(val)),

          zod.object({
            mode: zod.literal('fill'),
            nbChannels: zod.optional(zod.literal(3).or(zod.literal(4))),
            background: colorSchema,
            widthPx: zod.number().min(1),
            heightPx: zod.number().min(1)
          }),

          zod.object({
            mode: zod.literal('gradient'),
            angleDeg: zod.number(),
            colorStops: zod.array(
              zod.object({
                color: zod.string(),
                offsetPercent: zod.number() 
              })
            ),
            widthPx: zod.number().min(1),
            heightPx: zod.number().min(1)
          })

        ]),
        top: zod.optional(zod.number()),
        left: zod.optional(zod.number()),
        tile: zod.optional(zod.boolean()),
        gravity: zod.number().or(zod.string()),
        blend: zod.optional(zod.enum([
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
        ]))
      })
    ),
  })
})
