import zod from 'zod'
import sharp from 'sharp'
import { colorSchema, OperationNames } from '../index'

export type ComposeOverlayFillOperationParams = {
  mode: 'fill',
  channels?: sharp.Create['channels'],
  background: sharp.Create['background'] 
}

export type ComposeOverlayGradientOperationParams = {
  mode: 'gradient',
  angle: number,
  stops: { color: string, offset: number }[]
}

export type ComposeOperationParams = {
  background?: sharp.Color,
  images: {
    input: { 
      overlay: {
        width?: sharp.Create['width'],
        height?: sharp.Create['height']
      }  & (ComposeOverlayFillOperationParams | ComposeOverlayGradientOperationParams)
    }
    blend: sharp.Blend,
    gravity: sharp.Gravity,
    top?: number,
    left?: number,
    tile?: boolean
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
    background: zod.optional(zod.array(colorSchema)),
    images: zod.array(zod.object({
      input: 
      zod.custom<Buffer>(val => Buffer.isBuffer(val)).or(
        zod.object({
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
              angle: zod.number(),
              stops: zod.array(
                zod.object({
                  color: zod.string(),
                  offset: zod.number().min(0).max(100)
                })
              )
            })
          ])
        })
      ),
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
