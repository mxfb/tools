import zod from 'zod'
import { OperationNames } from '../_utils/operation-names'

export type BrightnessOperationParams = {
  brightness: number 
}

export type BrightnessOperation = {
  name: typeof OperationNames.Brightness,
  params: BrightnessOperationParams
}

export const brightnessSchema: zod.ZodType<BrightnessOperation> = zod.object({
  name: zod.literal(OperationNames.Brightness),
  params: zod.object({
    brightness: zod.number().min(0)
  })
})
