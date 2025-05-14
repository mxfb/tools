import zod from 'zod'
import { colorSchema, OperationNames } from '..'
import sharp from 'sharp'
import { CreateBackgroundLine } from '../operations/_utils/frame/backgrounds/create-line-background';
import { createLineBackgroundSchema } from './backgrounds/create-line-background';

export type FrameOperation = {
  name: typeof OperationNames.Frame,
  params: FrameOperationParams
}

export type FrameOperationParams = {
    dimensions: {
        widthPx: number,
        heightPx: number
    },
    background: sharp.Color | FrameCreateBackground,
    position: {
        top?: FramePosition,
        left?: FramePosition,
        right?:  number | string,
        bottom?:  number | string,
    } 
};

type FramePosition = number | string | 'center';

export type FrameCreateBackground = (CreateBackgroundLine) & FrameCreateBackgroundOptions;

type FrameCreateBackgroundOptions = {
    colorPalette?: {
      extract?: {
        nbColor: number,
      },
      use?: {
        RGBColors: [number, number, number][]
      },
      densify?: {
        types: ('default' | 'default-lighten' | 'default-saturate' | 'complementary' | 'complementary-lighten' | 'complementary-saturate')[],
        ligthenIntensity?: number,
        saturateIntensity?: number,
      },
      compose?: {
        nbColor?: number,
        mix?: boolean
      }
    },
}

const positionSchema = zod.union([
    zod.number().min(0),
    zod.string(),
    zod.literal('center')
]);

const createBackgroundOptionsSchema = {
  colorPalette: zod.optional(zod.object({
    extract: zod.optional(zod.object({
      nbColor: zod.number()
    })),
    use: zod.optional(zod.object({
      RGBColors: zod.array(zod.tuple([zod.number(), zod.number(), zod.number()]))
    })),
    densify: zod.optional(zod.object({
      types: zod.array(zod.enum([
          'default',
          'default-lighten',
          'default-saturate',
          'complementary',
          'complementary-lighten',
          'complementary-saturate'
      ])),
      ligthenIntensity: zod.optional(zod.number()),
      saturateIntensity: zod.optional(zod.number()),
    })),
    compose: zod.optional(zod.object({
      nbColor: zod.optional(zod.number()),
      mix: zod.optional(zod.boolean())
    }))
  }))
}

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
    background: zod.union([
      colorSchema,
      createLineBackgroundSchema.extend(createBackgroundOptionsSchema)
    ])
  })
})