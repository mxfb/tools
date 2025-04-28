import zod from 'zod'
import { colorSchema, OperationNames } from '../operations'
import { InnerResizeParams } from '../operations/_utils/inner-resize'

export type InnerResizeOperationParams = InnerResizeParams

export type InnerResizeOperation = {
  name: typeof OperationNames.InnerResize,
  params: InnerResizeOperationParams
}

export const innerResizeSchema: zod.ZodType<InnerResizeOperation> = zod.object({
  name: zod.literal(OperationNames.InnerResize),
  params: zod.object({
    outputDimensions: zod.optional(zod.object({
      width: zod.number(),
      height: zod.number()
    })),
    innerRatio: zod.optional(zod.number().min(0).max(100)),
    innerGravity: zod.optional(zod.enum([
      'top-left',
      'top-center',
      'top-right',
      'left-center',
      'center',
      'right-center',
      'bottom-left',
      'bottom-center',
      'bottom-right'
    ])),
    background: zod.optional(colorSchema)
  })
})
