import sharp from "sharp";
import { Thumbnails } from "../../../../../@design-edito";
import { Palette } from "../../../../../@design-edito/thumbnails/colors";
import { areaLineCompose, DEFAULT_COMPOSITION_LINE_PARAMS, LineAreaComposition } from "./area-line-composition";
import { areaTileCompose, TileAreaComposition } from "./area-tile-composition";


type CompositionType = TileAreaComposition | LineAreaComposition;

type RequiredAreaCompositionParams = {
    innerTransformation: { w: number, h: number, x: number, y: number }
    palette: {
        additionalColors: Palette;
        createFrom: ('default' | 'default-lighten' | 'default-saturate' | 'complementary' | 'complementary-lighten' | 'complementary-saturate')[],
        maxDensity: number;
        useAdditionalColorsOnly: boolean;
        useExtractFromInner: boolean;
        extractDensity: number;
        lightenIntensity: number;
        saturateIntensity: number;
    }
    composition: CompositionType | undefined
}

export type AreaCompositionParams = {
    innerTransformation: RequiredAreaCompositionParams['innerTransformation'],
    palette?: Partial<RequiredAreaCompositionParams['palette']>,
    composition?: Partial<RequiredAreaCompositionParams['composition']>,
};

const DEFAULT_AREA_COMPOSITION_PARAMS: RequiredAreaCompositionParams = {
    innerTransformation: { w: 0, h: 0, x: 0, y: 0 },
    palette: {
        additionalColors: [],
        createFrom: ['default'],
        maxDensity: 100,
        useExtractFromInner: true,
        useAdditionalColorsOnly: false,
        extractDensity: 8,
        lightenIntensity: 20,
        saturateIntensity: 20,
    },
    composition: undefined,
}; 


/* Area composes creates areas & tiles aorund given innerTransformation */
export async function areaCompose(inputSharp: sharp.Sharp, customParams?: Partial<AreaCompositionParams>) {

    /* Merge options with default options */
    const options = getParams(customParams);

    /* Retrieving metadata we need */
    const inputMetadata = await inputSharp.metadata();
    const outputDimensions = {
        w: inputMetadata.width || 0,
        h: inputMetadata.height || 0,
    };
    
    
    /* Creating the palette from the pixels in our input */ 
    /* By default, we only use the given inner zone */
    const inputSharpCopy = sharp(await (inputSharp.toBuffer()));
    const innerExtractedSharp = await (inputSharpCopy.extract({ left: options.innerTransformation.x, top: options.innerTransformation.y, width: options.innerTransformation.w, height: options.innerTransformation.h }).resize({width: options.innerTransformation.w, height: options.innerTransformation.h}).png({ quality: 100 }));
    const inputExtract = options.palette.useExtractFromInner ? innerExtractedSharp : inputSharp;
    const inputExtractDimensions = options.palette.useExtractFromInner ? options.innerTransformation : outputDimensions;
    
    const inputExtractBufferData = await inputExtract.raw().toBuffer();

    const imagePalette = Thumbnails.Colors.extractPaletteFromImage(
        inputExtractBufferData, 
        inputExtractDimensions, 
        options.palette.additionalColors,
        {
            useAdditionalColorsOnly: options.palette.useAdditionalColorsOnly,
            extractDensity: options.palette.extractDensity,
            lightenIntensity: options.palette.lightenIntensity,
            saturateIntensity: options.palette.saturateIntensity,
        }, (await inputExtract.metadata()).channels);
    const { mixedPalette } = composePalette(imagePalette, options.palette.createFrom, options.palette.maxDensity);

    /* Start all our composition */
    inputSharp.png({ quality: 100 }); /* We must make sure we work with the best quality atm */


    /* Handle composition */
    const composition = options.composition ? await getComposition(inputSharp, options.composition, {
        palette: mixedPalette,
        paletteOptions: options.palette,
        outputDimensions,
        innerTransformation: options.innerTransformation
    }) : []; 
    
    /* Creating our output with a background, with a given format to be able to be exported  */
    const background = mixedPalette[0] || [255, 255, 255];
    const outputSharp = await createSharpShape(outputDimensions, background).png({ quality: 100 });

    /* Composing all inputs together in a single sharp */
    const composedSharp = outputSharp.composite(composition);

    /* Returning a flatten version */
    return await composedSharp.flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } });
}

const DEFAULT_COMPOSITION_TILE_PARAMS: TileAreaComposition['params'] = {
    densityA: { min: 1, max: 1 },
    densityB: { min: 1, max: 1 },
    coverage: 50,
    format: 'default',
    xEasing: 'none',
    yEasing: 'none',
}; 

function getParams(customParams?: Partial<AreaCompositionParams>): RequiredAreaCompositionParams {
    if (!customParams) { return DEFAULT_AREA_COMPOSITION_PARAMS };
    const options: RequiredAreaCompositionParams = {
        ...DEFAULT_AREA_COMPOSITION_PARAMS,
        ...customParams,
        palette: {
            ...DEFAULT_AREA_COMPOSITION_PARAMS.palette,
            ...customParams.palette,
        },
        composition: undefined
    }

    if (customParams.composition) {
        switch (customParams.composition.type) {
            case 'line': {
                options.composition = {
                    type: 'line',
                    params: {
                        ...DEFAULT_COMPOSITION_LINE_PARAMS,
                        ...(customParams.composition.params || {})
                    }
                }
                break;
            }
            case 'tile': {
                options.composition = {
                    type: 'tile',
                    params: {
                        ...DEFAULT_COMPOSITION_TILE_PARAMS,
                        ...(customParams.composition.params || {})
                    }
                }
            }
        }
    }

    return options;
}

function getComposition(inputSharp: sharp.Sharp, composition: CompositionType, options: CompositionOptions): Promise<sharp.OverlayOptions[]> {
    switch (composition.type) {
        case 'line':
            return areaLineCompose(inputSharp, composition, options);
        case 'tile':
            return areaTileCompose(inputSharp, composition, {
                ...options,
                palette: Thumbnails.Common.shuffleArray(options.palette)
            });
        default:
            return new Promise(() => []);
    }
}

type DetailedPalette = Partial<{[key in RequiredAreaCompositionParams['palette']['createFrom'][0]]: Thumbnails.Colors.Color[]}>;
function composePalette(palette: Thumbnails.Colors.PaletteExtract, paletteOption: RequiredAreaCompositionParams['palette']['createFrom'], maxPaletteDensity: number): { mixedPalette: Thumbnails.Colors.Palette, detailedPalette: DetailedPalette } {
    let composedPalette: Thumbnails.Colors.Palette = [];
    const detailedPalette: DetailedPalette = {};
    
    if (paletteOption.includes('default-lighten')) {
        composedPalette = [...composedPalette, ...palette.default.lighten];
        detailedPalette['default-lighten'] = palette.default.lighten;
    }
    if (paletteOption.includes('default-saturate')) {
        composedPalette = [...composedPalette, ...palette.default.saturate];
        detailedPalette['default-saturate'] = palette.default.saturate;
    }
    if (paletteOption.includes('complementary')) {
        composedPalette = [...composedPalette, ...palette.complementary.default];
        detailedPalette['complementary'] = palette.default.default;
    }
    if (paletteOption.includes('complementary-lighten')) {
        composedPalette = [...composedPalette, ...palette.complementary.lighten];
        detailedPalette['complementary-lighten'] = palette.complementary.lighten;
    }
    if (paletteOption.includes('complementary-saturate')) {
        composedPalette = [...composedPalette, ...palette.complementary.saturate];
        detailedPalette['complementary-saturate'] = palette.complementary.saturate;
    }
    
    if (paletteOption.includes('default') || !composedPalette.length) {
        composedPalette = [...composedPalette, ...palette.default.default];
        detailedPalette['default'] = palette.default.default;
    }

    const outputPalette = composedPalette.length > maxPaletteDensity ? composedPalette.splice(0, maxPaletteDensity) : composedPalette
    return {
        mixedPalette: outputPalette,
        detailedPalette: detailedPalette
    };
}


function createSharpShape(dimensions: { w: number, h: number }, background: Thumbnails.Colors.Color) {
    return sharp(
        {
            create: {
                width: Math.round(dimensions.w),
                height: Math.round(dimensions.h),
                channels: 4,
                background: { r: background[0], g: background[1], b: background[2], alpha: 1 }
            }
        }
    )
}