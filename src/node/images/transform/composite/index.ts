import zod from 'zod'
import sharp from 'sharp'
import { colorSchema, OperationNames } from '../operations'

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
