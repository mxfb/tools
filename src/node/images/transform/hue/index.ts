import zod from 'zod'
import { OperationNames } from '..'

export type HueOperationParams = {
  hue: number 
}

export type HueOperation = {
  name: typeof OperationNames.Hue,
  params: HueOperationParams
}

export const hueSchema: zod.ZodType<HueOperation> = zod.object({
  name: zod.literal(OperationNames.Hue),
  params: zod.object({
    hue: zod.number().min(0)
  })
})
