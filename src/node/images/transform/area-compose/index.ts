import zod from 'zod'
import { AreaCompositionParams, _AreaCompositionParams } from '../operations/_utils/area-composition'
import { OperationNames } from '..'

export type AreaComposeOperationParams = Partial<AreaCompositionParams>

export type AreaComposeOperation = {
  name: typeof OperationNames.AreaComposition,
  params: AreaComposeOperationParams
}

const colorTransformationSchema = zod.array(zod.object({
  type: zod.enum([
    'saturate',
    'lighten',
    'complement'
  ]),
  intensity: zod.number(),
  intensityMode: zod.enum(['add', 'set'])
}));

// [WIP] le schéma ne matche pas le type (@todo: additionalColors avec [number, number, number])
export const areaComposeSchema: zod.ZodType<AreaComposeOperation> = zod.object({
  name: zod.literal(OperationNames.AreaComposition),
  params: zod.object({
    innerTransformation: zod.optional(zod.object({
      w: zod.number(),
      h: zod.number(),
      x: zod.number(),
      y: zod.number()
    })),
    palette: zod.optional(zod.object({
      additionalColors: zod.optional(zod.array(zod.number()).length(3).max(3)),
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
    composition: zod.optional(zod.union([
      zod.object({
        type: zod.literal('tile'),
        params: zod.optional(zod.object({
          coverage: zod.number().min(0).max(100),
          densityA: zod.object({min: zod.number(), max: zod.number()}),
          densityB: zod.object({min: zod.number(), max: zod.number()}),
          format: zod.enum([
            'random',
            'default',
            'portrait',
            'landscape'
          ]),
          xEasing: zod.string(),
          yEasing: zod.string(),
        }))
      }),
      zod.object({
        type: zod.literal('line'),
        params: zod.optional(zod.object({
          nbLines: zod.number().min(0).max(20),
          colors: zod.object({
            base: zod.enum(['first', 'last']).or(zod.number()),
            primary: colorTransformationSchema,
            secondary: colorTransformationSchema
          })
        }))
      }),
      zod.undefined()
    ]))
  })
})