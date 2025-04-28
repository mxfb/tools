import sharp, { Color } from 'sharp'
import zod from 'zod'
import { colorSchema, OperationNames } from '../operations'

export type ResizeOperationParams = {
  width: number
  height: number
  background?: Color
  fit?: keyof sharp.FitEnum
}

export type ResizeOperation = {
  name: typeof OperationNames.Resize,
  params: ResizeOperationParams
}

export const resizeSchema: zod.ZodType<ResizeOperation> = zod.object({
  name: zod.literal(OperationNames.Resize),
  params: zod.object({
    width: zod.number(),
    height: zod.number(),
    background: zod.optional(colorSchema),
    fit: zod.enum([
      'contain',
      'cover',
      'fill',
      'inside',
      'outside'
    ]).optional()
  })
})
