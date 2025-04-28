import zod from 'zod'
import { OperationNames } from '..'

export type SaturationOperationParams = {
  saturation: number 
}

export type SaturationOperation = {
  name: typeof OperationNames.Saturation
  params: SaturationOperationParams
}

export const saturationSchema: zod.ZodType<SaturationOperation> = zod.object({
  name: zod.literal(OperationNames.Saturation),
  params: zod.object({
     saturation: zod.number().min(0)
  })
})
