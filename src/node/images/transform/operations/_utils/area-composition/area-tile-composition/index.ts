import { Thumbnails } from "../../../../../../@design-edito";
import sharp from "sharp";

export type TileAreaComposition = {
    type: 'tile',
    params: {
        coverage: number;
        densityA: { min: number, max: number };
        densityB: { min: number, max: number };
        format:  'random' | 'default' | 'portrait' | 'landscape' ;
        xEasing: string;
        yEasing: string;
    };
};


export type Dimensions = {
    w: number,
    h: number
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

export async function areaTileCompose(inputSharp: sharp.Sharp, composition: TileAreaComposition, options: CompositionOptions): Promise<sharp.OverlayOptions[]> {
    // Calculating all areas and tiles dimensions + positions
    const shapesLayout = Thumbnails.Layout.packAreasAndTiles(
        options.innerTransformation, 
        options.outputDimensions,
        composition.params.coverage,
        { A: composition.params.densityA, B: composition.params.densityB },
        { X: composition.params.xEasing, Y: composition.params.yEasing }
    );

    /* Preparing all our shapes for composition */
    const sharpShapes = getSharpTilesInputs(shapesLayout, options.palette);
    const sharpShapesForComposite = [];
    for await (const sharpShape of sharpShapes) {;
        sharpShapesForComposite.push({
            input: await sharpShape.input.toFormat('png').toBuffer(),
            left: sharpShape.left,
            top: sharpShape.top,
        })
    }

    return [
        {
            input: await inputSharp.png({ quality: 100 }).toBuffer(), /* Converting to png to handle alpha */
            left: 0,
            top: 0,
        },
        ...sharpShapesForComposite,
    ]
}