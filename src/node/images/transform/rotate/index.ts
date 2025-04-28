import zod from 'zod'
import { OperationNames } from '..'

export type RotateOperation = {
  name: typeof OperationNames.Rotate,
  params: {
    angle: number
  }
}

export const rotateSchema: zod.ZodType<RotateOperation> = zod.object({
  name: zod.literal(OperationNames.Rotate),
  params: zod.object({
    angle: zod.number()
  })
})
