import zod from 'zod'
import { areaCompose, AreaCompositionParams } from '../_utils/area-composition'
import { OperationNames } from '..'

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
            }))
          }))
        }))
      })
    ])
  })
})
