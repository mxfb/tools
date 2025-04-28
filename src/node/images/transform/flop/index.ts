import zod from 'zod'
import { OperationNames } from '..'

export type FlopOperationParams = {
  flop?: boolean
}

export type FlopOperation = {
  name: typeof OperationNames.Flop,
  params: FlopOperationParams
}

export const flopSchema: zod.ZodType<FlopOperation> = zod.object({
  name: zod.literal(OperationNames.Flop),
  params: zod.object({
    flop: zod.boolean().optional()
  })
})
