import zod from 'zod'
import { colorSchema, OperationNames } from '..'

export type FlattenOperationParams = {
  background: string | {
    r: number
    g: number
    b: number
  }
}

export type FlattenOperation = {
  name: typeof OperationNames.Flatten,
  params: FlattenOperationParams
}

export const flattenSchema: zod.ZodType<FlattenOperation> = zod.object({
  name: zod.literal(OperationNames.Flatten),
  params: zod.object({
    background: colorSchema
  })
})
