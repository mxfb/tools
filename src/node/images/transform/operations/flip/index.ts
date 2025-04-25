import zod from 'zod'
import { OperationNames } from '..'

export type FlipOperationParams = {
  flip?: boolean
} 

export type FlipOperation = {
  name: typeof OperationNames.Flip,
  params: FlipOperationParams
}

export const flipSchema: zod.ZodType<FlipOperation> = zod.object({
  name: zod.literal(OperationNames.Flip),
  params: zod.object({
    flip: zod.boolean().optional()
  })
})
