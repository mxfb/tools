import sharp from "sharp";
import { Thumbnails } from "~/node/@design-edito";

export type Dimensions = {
    w: number,
    h: number
}

export type Options = {
    formats: string[];
    nbOutputs: number,
    dimensions: Dimensions,
    imagePosition: 'top-left' | 'top-center' | 'top-right' | 'left-center' | 'center' | 'right-center' | 'bottom-left' | 'bottom-center' | 'bottom-right',
    imageOccupation: number,

    palette: ('default' | 'default-lighten' | 'default-saturate' | 'complementary' | 'complementary-lighten' | 'complementary-saturate')[],
    colors?: (string|{r: number, g: number, b: number})[];
    maxPaletteDensity: number;
    extractPaletteDensity: number;
    lightenIntensity: number;
    saturateIntensity: number;
    colorFilter?: string;
    colorFilterApply?: 'all' | 'input-only' | 'shapes-only';

    tileCoverage: number;
    tileDensityA: { min: number, max: number }; 
    tileDensityB: { min: number, max: number };
    tileFormat: 'random' | 'default' | 'portrait' | 'landscape' ;
    tileXEasing: string;
    tileYEasing: string;
};

export type SharpShape = { 
    width: number, 
    height: number, 
    channels: 3 | 4, 
    background: {r: number, g: number, b: number, alpha: number}
}

export type SharpInput = {top: number, left: number, input: sharp.Sharp };

const DEFAULT_GENERATE_OPTIONS: Options = {
    formats: ['jpeg'],
    nbOutputs: 1,
    imagePosition: 'center',
    imageOccupation: 60,
    dimensions: { w: 300, h: 500 },
    palette: ['default'],
    maxPaletteDensity: 100,
    extractPaletteDensity: 8,
    lightenIntensity: 20,
    saturateIntensity: 20,
    colorFilterApply: 'all',
    tileDensityA: { min: 1, max: 1 },
    tileDensityB: { min: 1, max: 1 },
    tileCoverage: 50,
    tileFormat: 'default',
    tileXEasing: 'none',
    tileYEasing: 'none',
}; 


export async function areaCompose(inputSharp: sharp.Sharp, customOptions?: Partial<Options>) {

    /* Merge options with default options */
    const options = getOptions(customOptions);

    /* Retrieving metadata we need */
    const inputMetadata = await inputSharp.metadata();
    const initialDimensions = {
        w: inputMetadata.width || 0,
        h: inputMetadata.height || 0,
    };
    
    /* Creating the palette from the pixels in our input */ 
    const inputBufferData = await inputSharp.raw().toBuffer();
    const imagePalette = Thumbnails.Colors.extractPaletteFromImage(inputBufferData, initialDimensions, options);
    const composedPalette = composePalette(imagePalette, options.palette, options.maxPaletteDensity);

    /* Start all our composition */
    inputSharp.png({ quality: 100 }); /* We must make sure we work with the best quality atm */
    
    const outputDimensions = {
        w: options.dimensions.w,
        h: options.dimensions.h,
    }

    /* Calculating our new dimensions as we want our dimensions to only occupy a zone (options.imageOccupation) in the new output dimensions */ 
    const resizeInputDimensions = getNewInputImageDimensions(outputDimensions, options.imageOccupation);
    
    /* Resizing image with these new dimensions */ 
    const resizedInput = inputSharp.resize({
        width: resizeInputDimensions.w,
        height: resizeInputDimensions.h,
        fit: 'contain',
        background: {r: 255, g: 255, b: 255, alpha: 0} // Add a transparent background
    }).toFormat('png'); // Transform to PNG to make sure it uses transparency on composite
    
    /* Our image now have new dimensions */
    /* We must calc where our image will be located in the new output */
    const resizedInputPositions = getImagePositions(options.imagePosition, resizeInputDimensions, resizeInputDimensions, outputDimensions);

    // Calculating all areas and tiles dimensions + positions
    const shapesLayout = Thumbnails.Layout.packAreasAndTiles(
        {
            ...resizedInputPositions, 
            ...resizeInputDimensions
        }, 
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
    const outputSharp = await createSharpShape(outputDimensions, background).toFormat('webp');

    /* Composing all inputs together in a single sharp */
    const composedSharp = outputSharp.composite([
        {
            input: await resizedInput.toFormat('webp').toBuffer(), /* Converting to png to handle alpha */
            left: Math.round(resizedInputPositions.x),
            top: Math.round(resizedInputPositions.y),
        },
        ...sharpShapesForComposite,
    ])

    /* Returning a flatten version */
    return await composedSharp.flatten();
}

function getOptions(customOptions?: Partial<Options>){
    if (!customOptions) { return DEFAULT_GENERATE_OPTIONS };
    const options = {
        ...DEFAULT_GENERATE_OPTIONS,
        ...customOptions,
    }

    return options;
}

function getNewInputImageDimensions(formatDimensions: Dimensions, imageOccupation: number) {
    const placeRatio = imageOccupation / 100;
    return { 
        w: Math.round(formatDimensions.w * placeRatio), 
        h: Math.round(formatDimensions.h * placeRatio) 
    };
}

function composePalette(palette: Thumbnails.Colors.PaletteExtract, paletteOption: Options['palette'], maxPaletteDensity: number): Thumbnails.Colors.Palette {
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


function getImagePositions(position: Options['imagePosition'], resizedImageDimensions: Thumbnails.Layout.Dimensions, containedImageDimensions: Thumbnails.Layout.Dimensions, wrapperDimensions: Thumbnails.Layout.Dimensions) {
    switch (position) {
        case 'top-left':
        return Thumbnails.Layout.alignTopLeft(resizedImageDimensions, containedImageDimensions, wrapperDimensions);
        case 'top-center':
        return Thumbnails.Layout.alignTopCenter(resizedImageDimensions, containedImageDimensions, wrapperDimensions);
        case 'top-right':
        return Thumbnails.Layout.alignTopRight(resizedImageDimensions, containedImageDimensions, wrapperDimensions);
        case 'left-center':
        return Thumbnails.Layout.alignLeftCenter(resizedImageDimensions, containedImageDimensions, wrapperDimensions);
        case 'center':
        return Thumbnails.Layout.alignCenter(resizedImageDimensions, containedImageDimensions, wrapperDimensions);
        case 'right-center':
        return Thumbnails.Layout.alignRightCenter(resizedImageDimensions, containedImageDimensions, wrapperDimensions);
        case 'bottom-left':
        return Thumbnails.Layout.alignBottomLeft(resizedImageDimensions, containedImageDimensions, wrapperDimensions);
        case 'bottom-center':
        return Thumbnails.Layout.alignBottomCenter(resizedImageDimensions, containedImageDimensions, wrapperDimensions);
        case 'bottom-right':
        return Thumbnails.Layout.alignBottomRight(resizedImageDimensions, containedImageDimensions, wrapperDimensions);
        default:
        return { x: 0, y: 0 };
    }
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