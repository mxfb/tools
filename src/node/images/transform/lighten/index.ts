import zod from 'zod'
import { OperationNames } from '../_utils/operation-names'

export type LightnessOperationParams = {
  lightness: number 
}

export type LightnessOperation = {
  name: typeof OperationNames.Lightness,
  params: LightnessOperationParams
}

export const lightnessSchema: zod.ZodType<LightnessOperation> = zod.object({
  name: zod.literal(OperationNames.Lightness),
  params: zod.object({
    lightness: zod.number().min(0)
  })
})
