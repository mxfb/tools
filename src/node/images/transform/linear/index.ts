import zod from 'zod'
import { OperationNames } from '../_utils/operation-names'

export type LinearOperationParams = {
  multiplier: number | [number, number, number]
  offset?: number | [number, number, number]
}

export type LinearOperation = {
  name: typeof OperationNames.Linear,
  params: LinearOperationParams
}

export const linearSchema: zod.ZodType<LinearOperation> = zod.object({
  name: zod.literal(OperationNames.Linear),
  params: zod.object({
    multiplier: zod.union([
      zod.number(),
      zod.tuple([
        zod.number(),
        zod.number(),
        zod.number()
      ])
    ]),
    offset: zod.optional(
      zod.union([
        zod.number(),
        zod.tuple([
          zod.number(),
          zod.number(),
          zod.number()
        ])]))
  })
})
