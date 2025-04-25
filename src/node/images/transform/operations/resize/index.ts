import sharp from 'sharp'
import zod from 'zod'
import { OperationNames } from '..'

export type ResizeOperationParams = {
  width: number
  height: number,
  fit?: keyof sharp.FitEnum,
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
    fit: zod.enum([
      'contain',
      'cover',
      'fill',
      'inside',
      'outside'
    ]).optional()
  })
})
