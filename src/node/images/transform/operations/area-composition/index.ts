import sharp from "sharp";
import { Thumbnails } from "../../../../@design-edito";

export type Dimensions = {
    w: number,
    h: number
}

type RequiredAreaCompositionParams = {
    innerTransformation: { w: number, h: number, x: number, y: number }
    
    colors?: (string|{r: number, g: number, b: number})[]; // @todo
    usePaletteFromInner: boolean;
    palette: ('default' | 'default-lighten' | 'default-saturate' | 'complementary' | 'complementary-lighten' | 'complementary-saturate')[],
    maxPaletteDensity: number;
    extractPaletteDensity: number;
    lightenIntensity: number;
    saturateIntensity: number;

    tileCoverage: number;
    tileDensityA: { min: number, max: number }; 
    tileDensityB: { min: number, max: number };
    tileFormat: 'random' | 'default' | 'portrait' | 'landscape' ;
    tileXEasing: string;
    tileYEasing: string;
}

export type AreaCompositionParams = Partial<RequiredAreaCompositionParams> & { innerTransformation: RequiredAreaCompositionParams['innerTransformation']};

export type SharpShape = { 
    width: number, 
    height: number, 
    channels: 3 | 4, 
    background: {r: number, g: number, b: number, alpha: number}
}

export type SharpInput = {top: number, left: number, input: sharp.Sharp };

const DEFAULT_AREA_COMPOSITION_PARAMS: RequiredAreaCompositionParams = {
    innerTransformation: { w: 0, h: 0, x: 0, y: 0 },

    usePaletteFromInner: true,
    palette: ['default'],
    maxPaletteDensity: 100,
    extractPaletteDensity: 8,
    lightenIntensity: 20,
    saturateIntensity: 20,

    tileDensityA: { min: 1, max: 1 },
    tileDensityB: { min: 1, max: 1 },
    tileCoverage: 50,
    tileFormat: 'default',
    tileXEasing: 'none',
    tileYEasing: 'none',
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
    const inputExtract = options.usePaletteFromInner ? innerExtractedSharp : inputSharp;
    const inputExtractDimensions = options.usePaletteFromInner ? options.innerTransformation : outputDimensions;
    
    const inputExtractBufferData = await inputExtract.raw().toBuffer();

    const imagePalette = Thumbnails.Colors.extractPaletteFromImage(
        inputExtractBufferData, 
        inputExtractDimensions, 
        {
            extractPaletteDensity: options.extractPaletteDensity,
            lightenIntensity: options.lightenIntensity,
            saturateIntensity: options.saturateIntensity,
        }, (await inputExtract.metadata()).channels);
    const composedPalette = composePalette(imagePalette, options.palette, options.maxPaletteDensity);

    /* Start all our composition */
    inputSharp.png({ quality: 100 }); /* We must make sure we work with the best quality atm */

    // Calculating all areas and tiles dimensions + positions
    const shapesLayout = Thumbnails.Layout.packAreasAndTiles(
        options.innerTransformation, 
        outputDimensions,
        options.tileCoverage,
        { A: options.tileDensityA, B: options.tileDensityB },
        { X: options.tileXEasing, Y: options.tileYEasing }
    );

    /* Preparing all our shapes for composition */
    const sharpShapes = getSharpTilesInputs(shapesLayout, composedPalette);
    const sharpShapesForComposite = [];
    for await (const sharpShape of sharpShapes) {;
        sharpShapesForComposite.push({
            input: await sharpShape.input.toFormat('png').toBuffer(),
            left: sharpShape.left,
            top: sharpShape.top,
        })
      }

    /* Creating our output with a background, with a given format to be able to be exported  */
    const background = composedPalette[0] || [255, 255, 255];
    const outputSharp = await createSharpShape(outputDimensions, background).png({ quality: 100 });

    /* Composing all inputs together in a single sharp */
    const composedSharp = outputSharp.composite([
        {
            input: await inputSharp.png({ quality: 100 }).toBuffer(), /* Converting to png to handle alpha */
            left: 0,
            top: 0,
        },
        ...sharpShapesForComposite,
    ])

    /* Returning a flatten version */
    return await composedSharp.flatten();
}

function getParams(customParams?: Partial<AreaCompositionParams>): RequiredAreaCompositionParams {
    if (!customParams) { return DEFAULT_AREA_COMPOSITION_PARAMS };
    const options = {
        ...DEFAULT_AREA_COMPOSITION_PARAMS,
        ...customParams,
    }

    return options;
}

function composePalette(palette: Thumbnails.Colors.PaletteExtract, paletteOption: RequiredAreaCompositionParams['palette'], maxPaletteDensity: number): Thumbnails.Colors.Palette {
    let composedPalette: Thumbnails.Colors.Palette = [];
    
    if (paletteOption.includes('default-lighten')) {
        composedPalette = [...composedPalette, ...palette.default.lighten];
    }
    if (paletteOption.includes('default-saturate')) {
        composedPalette = [...composedPalette, ...palette.default.saturate];
    }
    if (paletteOption.includes('complementary')) {
        composedPalette = [...composedPalette, ...palette.complementary.default];
    }
    if (paletteOption.includes('complementary-lighten')) {
        composedPalette = [...composedPalette, ...palette.complementary.lighten];
    }
    if (paletteOption.includes('complementary-saturate')) {
        composedPalette = [...composedPalette, ...palette.complementary.saturate];
    }
    
    if (paletteOption.includes('default') || !composedPalette.length) {
        composedPalette = [...composedPalette, ...palette.default.default];
    }

    const shuffledPalette = Thumbnails.Common.shuffleArray(composedPalette);
    const outputPalette = composedPalette.length > maxPaletteDensity ? shuffledPalette.splice(0, maxPaletteDensity) : shuffledPalette
    return outputPalette;
}

function createSharpShape(dimensions: Dimensions, background: Thumbnails.Colors.Color) {
    return sharp(
        {
            create: getCreateSharpShape(dimensions, background)
        }
    )
}

function getCreateSharpShape(dimensions: Dimensions, background: Thumbnails.Colors.Color): SharpShape {
    return { 
        width: Math.round(dimensions.w),
        height: Math.round(dimensions.h),
        channels: 4,
        background: { r: background[0], g: background[1], b: background[2], alpha: 1 }
    }
}

export function getSharpTilesInputs(tiles: {x: number, y: number, w: number, h: number}[], palette: Thumbnails.Colors.Palette): Array<SharpInput> {
    let usedColorsIndexes: number[] = [];
    const paletteLength = palette.length;

    const getUnusedColorIndex = () => {
        const paletteIndex = Thumbnails.Common.randomInt(paletteLength);
        resetUnusedColorIndexesIfNeeded();

        if (usedColorsIndexes.includes(paletteIndex)) {
            return getUnusedColorIndex();
        }

        usedColorsIndexes.push(paletteIndex);
        return paletteIndex;
    }

    const resetUnusedColorIndexesIfNeeded = () => {
        if (usedColorsIndexes.length !== paletteLength) {
            return;
        }
        usedColorsIndexes = [];
    }

    return tiles.map((tile) => {
        const paletteIndex = getUnusedColorIndex();

        const color = palette[paletteIndex];
        if (!color) {
            return;
        }
        return {
            top: Math.round(tile.y),
            left: Math.round(tile.x),
            input: sharp(
                {
                    create: getCreateSharpShape(tile, color)
                }
            )
        }
    }).filter((sharpShape) => sharpShape !== undefined);
}