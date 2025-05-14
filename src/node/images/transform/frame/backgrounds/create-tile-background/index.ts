import zod from 'zod';

export const createTileBackgroundSchema = zod.object({
    type: zod.literal('tile'),
    params: zod.object({
        coverage: zod.number(),
        densityA: zod.object({
            min: zod.number(),
            max: zod.number(),
        }),
        densityB: zod.object({
            min: zod.number(),
            max: zod.number(),
        }),
        format: zod.array(zod.enum([
            'random',
            'default',
            'portrait',
            'landscape'
        ])),
        xEasing: zod.string(),
        yEasing: zod.string()
    })
})  