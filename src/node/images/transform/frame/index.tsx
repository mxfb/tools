import zod from 'zod'
import { colorSchema, OperationNames } from '..'
import sharp from 'sharp'

type FramePosition = number | string | 'center';

export type FrameOperationParams = {
    dimensions: {
        widthPx: number,
        heightPx: number
    },
    background: sharp.Color,
    position: {
        top?: FramePosition,
        left?: FramePosition,
        right?:  number | string,
        bottom?:  number | string,
    } 
};

export type FrameOperation = {
  name: typeof OperationNames.Frame,
  params: FrameOperationParams
}

const positionSchema = zod.union([
    zod.number().min(0),
    zod.string(),
    zod.literal('center')
]);

export const frameSchema: zod.ZodType<FrameOperation> = zod.object({
  name: zod.literal(OperationNames.Frame),
  params: zod.object({
    dimensions: zod.object({
        widthPx: zod.number().min(0),
        heightPx: zod.number().min(0),
    }),
    position: zod.object({
        top: positionSchema,
        left: positionSchema,
        bottom: positionSchema,
        right: positionSchema,
    }),
    background: colorSchema
  })
})