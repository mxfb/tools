import zod from 'zod';

export const colorTransformationsSchema = zod.array(zod.object({
    type: zod.enum(['saturate', 'lighten', 'complement']),
    intensity: zod.number().min(0).max(100),
    intensityMode: zod.enum(['add', 'set'])
}));

export const createLineBackgroundSchema = zod.object({
    type: zod.literal('line'),
    params: zod.object({
        nbLines: zod.number().min(1),
        colors: zod.object({
            basePaletteIndex: zod.union([
                zod.literal('first'),
                zod.literal('last'),
                zod.number().min(0)
            ]),
            primaryTransformations: colorTransformationsSchema,
            secondaryTransformations: colorTransformationsSchema
        })
    })
})  