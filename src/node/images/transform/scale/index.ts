import zod from 'zod'
import { colorSchema, OperationNames } from '..'
import sharp from 'sharp'

export type ScaleOperationParams = {
  xRatio?: number,
  yRatio?: number,
  background?: sharp.Color
}

export type ScaleOperation = {
  name: typeof OperationNames.Scale,
  params: ScaleOperationParams
}

export const scaleSchema: zod.ZodType<ScaleOperation> = zod.object({
  name: zod.literal(OperationNames.Scale),
  params: zod.object({
    xRatio: zod.optional(zod.number().min(0).max(1)),
    yRatio: zod.optional(zod.number().min(0).max(1)),
    background: colorSchema
  })
})