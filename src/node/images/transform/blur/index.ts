import zod from 'zod'
import { OperationNames } from '..'

export type BlurOperationParams = {
  sigma: number
}

export type BlurOperation = {
  name: typeof OperationNames.Blur,
  params: BlurOperationParams
}

export const blurSchema: zod.ZodType<BlurOperation> = zod.object({
  name: zod.literal(OperationNames.Blur),
  params: zod.object({
    sigma: zod.number()
  })
})
