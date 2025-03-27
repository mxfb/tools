// Exports individuels sans namespace 

import sharp from "sharp"
import { areaCompose } from "./area-composition"
import { z } from "zod";

// Operations Names 
const OperationNames = {
    Rotate: 'rotate',
    Resize: 'resize',
    InnerResize: 'inner-resize',
    Extract: 'extract',
    Extend: 'extend',
    AreaComposition: 'area-composition',
    Composite: 'composite',
    Flop: 'flop',
    Flip: 'flip',
    Blur: 'blur',
    Flatten: 'flatten',
    Normalise: 'normalise',
    Brightness: 'brightness',
    Saturation: 'saturation',
    Hue: 'hue',
    Lightness: 'lightness',
    Modulate: 'modulate',
    Linear: 'linear',
} as const;
 
// Rotate
export type RotateOperationParams = {
    angle: number
}
export type RotateOperation = {
    name: typeof OperationNames.Rotate,
    params: RotateOperationParams
}

// Resize
export type ResizeOperationParams = {
    width: number
    height: number,
    fit?: keyof sharp.FitEnum,
}
export type ResizeOperation = {
    name: typeof OperationNames.Resize,
    params: ResizeOperationParams
}

// Resize
export type InnerResizeOperationParams = {
    ratio: number,
    background?: { r: number, g: number, b: number } | string
}
export type InnerResizeOperation = {
    name: typeof OperationNames.InnerResize,
    params: InnerResizeOperationParams
}

// Extract (Crop)
export type ExtractOperationParams = {
    left: number,
    top: number,
    width: number
    height: number,
}
export type ExtractOperation = {
    name: typeof OperationNames.Extract,
    params: ExtractOperationParams
}

// Extend 
export type ExtendOperationParams = {
    left: number,
    right: number
    top: number,
    bottom: number,
    extendWith?: sharp.ExtendWith,
    background?: { r: number, g: number, b: number } | string
}
export type ExtendOperation = {
    name: typeof OperationNames.Extend,
    params: ExtendOperationParams
}

// Area-composition
export type AreaCompositionOperationParams = Partial<{}>;  /* @todo */
export type AreaCompositionOperation = {
    name: typeof OperationNames.AreaComposition,
    params: AreaCompositionOperationParams
}

// Flip
export type FlipOperationParams = {
    flip?: boolean
}; 
export type FlipOperation = {
    name: typeof OperationNames.Flip,
    params: FlipOperationParams
}

// Flop
export type FlopOperationParams = {
    flop?: boolean
}; 
export type FlopOperation = {
    name: typeof OperationNames.Flop,
    params: FlopOperationParams
}

// Blur
export type BlurOperationParams = {
    sigma: number
}
export type BlurOperation = {
    name: typeof OperationNames.Blur,
    params: BlurOperationParams
}

// Flatten (Add Background)
export type FlattenOperationParams = {
    background: { r: number, g: number, b: number } | string
}
export type FlattenOperation = {
    name: typeof OperationNames.Flatten,
    params: FlattenOperationParams
}

// Normalise (Enhance constrasts)
export type NormaliseOperationParams = {
    lower: number;
    upper: number;
}
export type NormaliseOperation = {
    name: typeof OperationNames.Normalise,
    params: NormaliseOperationParams
}

// Brightness
export type BrightnessOperationParams = {
    brightness: number 
}
export type BrightnessOperation = {
    name: typeof OperationNames.Brightness,
    params: BrightnessOperationParams
}

// Saturation
export type SaturationOperationParams = {
    saturation: number 
}
export type SaturationOperation = {
    name: typeof OperationNames.Saturation,
    params: SaturationOperationParams
}

// Hue
export type HueOperationParams = {
    hue: number 
}
export type HueOperation = {
    name: typeof OperationNames.Hue,
    params: HueOperationParams
}

// Lightness
export type LightnessOperationParams = {
    lightness: number 
}
export type LightnessOperation = {
    name: typeof OperationNames.Lightness,
    params: LightnessOperationParams
}

// Modulate
export type ModulateOperationParams = {
    brightness?: number; 
    lightness?: number; 
    hue?: number; 
    saturation?: number; 
}
export type ModulateOperation = {
    name: typeof OperationNames.Modulate,
    params: ModulateOperationParams
}

// Linear (Applies multiplier to RGB values)
export type LinearOperationParams = {
    multiplier: number | [number, number, number]; 
    offset?: number | [number, number, number];
}
export type LinearOperation = {
    name: typeof OperationNames.Linear,
    params: LinearOperationParams
}

// Composite (Add Layers to image)
export type CompositeOperationParamsOverlayFill = {
    mode: 'fill',
    channels?: sharp.Create['channels'],
    background: sharp.Create['background'] 
}
export type CompositeOperationParamsOverlayGradient = {
    mode: 'gradient',
    angle: number,
    stops: { color: string, offset: number }[]
}
export type CompositeOperationParams = {
    images: {
        input: Buffer | { overlay: {
            width?: sharp.Create['width'],
            height?: sharp.Create['height']
        } & (CompositeOperationParamsOverlayFill | CompositeOperationParamsOverlayGradient)},
        blend: sharp.Blend,
        gravity: sharp.Gravity,
        top?: number,
        left?: number,
        tile?: boolean
    }[]
};
export type CompositeOperation = {
    name: typeof OperationNames.Composite,
    params: CompositeOperationParams
}

// Operations
export type Operation = RotateOperation | InnerResizeOperation | ResizeOperation | ExtractOperation | AreaCompositionOperation | CompositeOperation | FlipOperation | FlopOperation | BlurOperation | BrightnessOperation | SaturationOperation | HueOperation | FlattenOperation | NormaliseOperation | ExtendOperation | LightnessOperation | ModulateOperation | LinearOperation;

export type Operations = Operation[];


export type Dimensions = {
    width: number,
    height: number
}

export async function transformImage (imageBuffer: Buffer, operations: Operations, maxDimensions: Dimensions): Promise<Buffer<ArrayBufferLike>> {
    /* Creates a sharpImage */
    let imageSharp = sharp(imageBuffer);

    /* Successively applies operations */
    for await (const operation of operations) {
        if (isOperation(operation)) {
            /* We use sharp result at each step */
            imageSharp = await applyOperation(imageSharp, operation, maxDimensions);
        }
    }

    return await imageSharp.toBuffer();
}

const colorSchema =  (z.string().min(7).max(7)).or(z.object({
    r: z.number().min(0).max(255),
    g: z.number().min(0).max(255),
    b: z.number().min(0).max(255),
}));
const operationsSchemas = {
    [OperationNames.Flip]: z.object({
        name: z.literal(OperationNames.Flip),
        params: z.object({
            flip: z.boolean().optional()
        })
    }),
    [OperationNames.Flop]: z.object({
        name: z.literal(OperationNames.Flop),
        params: z.object({
            flop: z.boolean().optional()
        })
    }),
    [OperationNames.Rotate]: z.object({
        name: z.literal(OperationNames.Rotate),
        params: z.object({
            angle: z.number()
        })
    }),
    [OperationNames.Blur]: z.object({
        name: z.literal(OperationNames.Blur),
        params: z.object({
            sigma: z.number()
        })
    }),
    [OperationNames.Flatten]: z.object({
        name: z.literal(OperationNames.Flatten),
        params: z.object({
            background: colorSchema
        })
    }),
    [OperationNames.AreaComposition]: z.object({
        name: z.literal(OperationNames.AreaComposition),
        params: z.object({}) /* @todo */
    }),
    [OperationNames.Composite]: z.object({
        name: z.literal(OperationNames.Composite),
        params: z.object({
            images: z.array(z.object({
                input: z.custom(val => {
                    return Buffer.isBuffer(val);
                }).or(z.object({
                    overlay: z.union([
                        z.object({
                            mode: z.literal('fill'),
                            background: colorSchema,
                            channels: z.optional(z.literal(3).or(z.literal(4))),
                            width: z.optional(z.number()),
                            height: z.optional(z.number())
                        }),
                        z.object({
                            mode: z.literal('gradient'),
                            width: z.optional(z.number()),
                            height: z.optional(z.number()),
                            stops: z.array(
                                z.object({
                                    color: z.string(),
                                    offset: z.number().min(0).max(100)
                                })
                            )
                        })
                    ])
                })),
                blend: z.enum(['clear', 'source', 'over', 'in', 'out', 'atop', 'dest', 'dest-over', 'dest-in', 'dest-out', 'dest-atop', 'xor', 'add', 'saturate', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion']),
                gravity: z.number().or(z.enum(['north', 'northeast', 'southeast', 'south', 'southwest', 'west', 'northwest', 'east', 'center', 'centre'])),
                top: z.optional(z.number()),
                left: z.optional(z.number()),
                tile: z.optional(z.boolean())
            }))
        }) /* @todo */
    }),
    [OperationNames.InnerResize]: z.object({
        name: z.literal(OperationNames.InnerResize),
        params: z.object({
            ratio: z.number().min(0).max(1),
            background: z.optional(colorSchema)
        })
    }),
    [OperationNames.Resize]: z.object({
        name: z.literal(OperationNames.Resize),
        params: z.object({
            width: z.number(),
            height: z.number(),
            fit: z.enum(['fit', 'contain', 'cover', 'fill', 'inside', 'outside']).optional()
        })
    }),
    [OperationNames.Extract]: z.object({
        name: z.literal(OperationNames.Extract),
        params: z.object({
            width: z.number(),
            height: z.number(),
            left: z.number(),
            top: z.number(),
        })
    }),
    [OperationNames.Extend]: z.object({
        name: z.literal(OperationNames.Extend),
        params: z.object({
            top: z.number(),
            left: z.number(),
            right: z.number(),
            bottom: z.number(),
            background: z.optional(colorSchema),
            extendWith: z.optional(z.enum(['background', 'copy', 'repeat', 'mirror']))
        })
    }),
    [OperationNames.Brightness]: z.object({
        name: z.literal(OperationNames.Brightness),
        params: z.object({
           brightness: z.number().min(0)
        })
    }),
    [OperationNames.Saturation]: z.object({
        name: z.literal(OperationNames.Saturation),
        params: z.object({
           saturation: z.number().min(0)
        })
    }),
    [OperationNames.Hue]: z.object({
        name: z.literal(OperationNames.Hue),
        params: z.object({
           hue: z.number().min(0)
        })
    }),
    [OperationNames.Lightness]: z.object({
        name: z.literal(OperationNames.Lightness),
        params: z.object({
           lightness: z.number().min(0)
        })
    }),
    [OperationNames.Modulate]: z.object({
        name: z.literal(OperationNames.Lightness),
        params: z.object({
           lightness: z.optional(z.number().min(0)),
           brightness: z.optional(z.number().min(0)),
           saturation: z.optional(z.number().min(0)),
           hue: z.optional(z.number().min(0))
        })
    }),
    [OperationNames.Linear]: z.object({
        name: z.literal(OperationNames.Linear),
        params: z.object({
           multiplier: z.optional(z.number()).or(z.array(z.number()).length(3)),
           offset: z.optional(z.number()).or(z.array(z.number()).length(3))
        })
    })
};

const operationSchema = z.union([
    operationsSchemas[OperationNames.Flip],
    operationsSchemas[OperationNames.Flop],
    operationsSchemas[OperationNames.Rotate],
    operationsSchemas[OperationNames.Blur],
    operationsSchemas[OperationNames.Brightness],
    operationsSchemas[OperationNames.Saturation],
    operationsSchemas[OperationNames.Lightness],
    operationsSchemas[OperationNames.Hue],
    operationsSchemas[OperationNames.Modulate],
    operationsSchemas[OperationNames.Linear],
    operationsSchemas[OperationNames.Flatten],
    operationsSchemas[OperationNames.Composite],
    operationsSchemas[OperationNames.AreaComposition],
    operationsSchemas[OperationNames.InnerResize],
    operationsSchemas[OperationNames.Resize],
    operationsSchemas[OperationNames.Extract],
    operationsSchemas[OperationNames.Extend],
])

export function isOperation(operation: unknown): operation is Operation {
    /* Check each zod schema and return true if operation matches a schema */
    return Boolean(operationSchema.parse(operation));
}

async function applyOperation(imageSharp: sharp.Sharp, operation: Operation, maxDimensions: Dimensions): Promise<sharp.Sharp> {
    const imageMetadata = await imageSharp.metadata();

    switch(operation.name) {
        case OperationNames.Rotate:
            return imageSharp.rotate(operation.params.angle);
        case OperationNames.InnerResize:
            const dimensions = {
                width: imageMetadata.width || 0,
                height: imageMetadata.height || 0,
            };
            const resizedSharp = imageSharp
                .resize({
                    width: Math.round(dimensions.width * (operation.params.ratio) / 100),
                    height: Math.round(dimensions.height * (operation.params.ratio) / 100),
                    fit: 'contain',
                    background: {r: 255, g: 255, b: 255, alpha: 0}
                }) /* Adds a transparent background (necessary for png) */
            return sharp({
                create: {
                    background: operation.params.background  && typeof operation.params.background === 'object' ? { ...operation.params.background, alpha: 1 } : { r: 255, g: 255, b: 255, alpha: 0 },
                    width: dimensions.width,
                    height: dimensions.height,
                    channels: 4,
                }
            }).toFormat('png').composite([
                {
                    input:  await resizedSharp.toFormat('png').toBuffer(),
                    gravity: 'center'
                }
            ]);
        case OperationNames.Resize:
            return imageSharp
                .resize({
                    width: operation.params.width,
                    height: operation.params.height,
                    fit: operation.params.fit || 'cover',
                    background: {r: 255, g: 255, b: 255, alpha: 0}
                }) /* Adds a transparent background (necessary for png) */
        case OperationNames.AreaComposition:
            const composedImage = await areaCompose(imageSharp, {
                ...operation.params,
                dimensions: {
                    w: maxDimensions.width,
                    h: maxDimensions.height
                }
            });
            return composedImage;
        case OperationNames.Extract:
            return imageSharp.extract({ 
                left: operation.params.left,
                top: operation.params.top, 
                width: operation.params.width, 
                height: operation.params.height,
            })
        case OperationNames.Extend:
            return imageSharp.extend({ 
                left: operation.params.left,
                top: operation.params.top, 
                right: operation.params.right, 
                bottom: operation.params.bottom,
                background: operation.params.background,
                extendWith: operation.params.extendWith || 'mirror'
            })
        case OperationNames.Flip:
            return imageSharp.flip(operation.params.flip);
        case OperationNames.Flop:
            return imageSharp.flop(operation.params.flop);
        case OperationNames.Blur:
            return imageSharp.blur(operation.params.sigma);
        case OperationNames.Flatten:
            return imageSharp.flatten({
                background: operation.params.background
            });
        case OperationNames.Normalise:
            return imageSharp.normalise({
                lower: operation.params.lower,
                upper: operation.params.upper
            });
        case OperationNames.Brightness:
            return imageSharp.modulate({
                brightness: operation.params.brightness
            })
        case OperationNames.Saturation:
            return imageSharp.modulate({
                saturation: operation.params.saturation
            })
        case OperationNames.Hue:
            return imageSharp.modulate({
                hue: operation.params.hue
            })
        case OperationNames.Lightness:
            return imageSharp.modulate({
                lightness: operation.params.lightness
            })
        case OperationNames.Modulate:
            return imageSharp.modulate({
                lightness: operation.params.lightness,
                brightness: operation.params.brightness,
                hue: operation.params.hue,
                saturation: operation.params.saturation,
            })
        case OperationNames.Linear:
            return imageSharp.linear(operation.params.multiplier, operation.params.offset);
        case OperationNames.Composite:
            return imageSharp.composite(operation.params.images.map((image) => {
                if ('overlay' in image.input) {
                    switch(image.input.overlay.mode) {
                        case 'fill':
                            return {
                                ...image,
                                input: {
                                    create: {
                                        background: image.input.overlay.background,
                                        channels: image.input.overlay.channels || 4,
                                        width: image.input.overlay.width || imageMetadata.width || 0,
                                        height: image.input.overlay.height || imageMetadata.height || 0,
                                    }
                                }
                            }
                        case 'gradient':
                            return {
                                ...image,
                                input: Buffer.from(`<svg viewBox="0 0 ${imageMetadata.width || 0} ${imageMetadata.height || 0}" xmlns="http://www.w3.org/2000/svg"  xmlns:xlink="http://www.w3.org/1999/xlink">
                                    <defs>
                                        <linearGradient id="myGradient" gradientTransform="rotate(${image.input.overlay.angle})">
                                        ${image.input.overlay.stops.map((stop) => `<stop offset="${stop.offset}%" stop-color="${stop.color}" />`).join(' ')}
                                        </linearGradient>
                                    </defs>
                                    <rect  x="0" y="0" width="100%" height="100%" fill="url('#myGradient')"></rect>
                                </svg>`
                                )
                            }
                    }
                } 
                return {
                    ...image,
                    input: image.input
                }
            }));
        default:
            return imageSharp;
    }
}