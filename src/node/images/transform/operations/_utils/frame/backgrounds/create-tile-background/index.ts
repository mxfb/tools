import sharp from 'sharp';
import { shuffle } from '../../../../../../../../agnostic/arrays/shuffle';
import { clamp } from '../../../../../../../../agnostic/numbers/clamp';
import { randomInt } from '../../../../../../../../agnostic/random/random';
import { Transitions } from '../../../../../../../../agnostic/time/transitions';
import { CreateTileBackground } from '../../../../../frame/backgrounds/create-tile-background';

type Coordinates = { 
    x: number, 
    y: number, 
    w: number, 
    h: number 
}

export const DEFAULT_CREATE_BACKGROUND_TILE_PARAMS: CreateTileBackground['params'] = {
    coverageRatio: 0.5,
    densityA: { min: 0, max: 0 },
    densityB: { min: 0, max: 0 },
    format: 'random',
    xEasing: "linear",
    yEasing: "linear"
}

export async function createTileBackground(
    background: CreateTileBackground, 
    dimensions: { widthPx: number, heightPx: number },
    imageCoordinates: Coordinates,
    colorPalette: [number, number, number][],
): Promise<sharp.OverlayOptions[]> {
    background = {
        ...background,
        params: {
            ...DEFAULT_CREATE_BACKGROUND_TILE_PARAMS,
            ...background.params 
        }
    }

    const tileCoordinatesList = getPackedTilesCoordinatesList(
        { 
            x: imageCoordinates.x, 
            y: imageCoordinates.y, 
            w: imageCoordinates.w, 
            h: imageCoordinates.h 
        },
        dimensions,
        background.params.coverageRatio,
        {
            A: background.params.densityA,
            B: background.params.densityB
        },
        { 
            X: background.params.xEasing, 
            Y: background.params.yEasing 
        },
        background.params.format
    );

    const sharpOverlays = createSharpOverlaysFromCoordinatesList(
        tileCoordinatesList,
        colorPalette
    );
    return sharpOverlays;
}


function getPackedTilesCoordinatesList(
    initialCoordinates: { x: number, y: number, w: number, h: number }, 
    dimensions: { widthPx: number, heightPx: number }, 
    tileCoverageRatio: number, 
    tileDensity: { A: { min: number, max: number }, B:  { min: number, max: number } }, 
    tileEasing: { 
        X: CreateTileBackground['params']['xEasing'], 
        Y: CreateTileBackground['params']['yEasing']
    },  
    tileFormat?: string
): Coordinates[] {
    // Considering our image as our first shape that we can't overlap
    const areaCoordinatesList: Coordinates[] = [];
    
    const basePositions = {
        top: Math.ceil(initialCoordinates.y),
        bottom: Math.ceil(initialCoordinates.y + initialCoordinates.h),
        left:  Math.ceil(initialCoordinates.x),
        right:  Math.ceil(initialCoordinates.x + initialCoordinates.w),
    }
    
    for (let i = 0; i < 9; i++) {
        if ( i === 4 ) { continue; }
        const middleColumn = i % 3 === 1;
        const rightColumn = i % 3 === 2;
        
        const topRow = i < 3;
        const middleRow = !topRow && i < 6;
        const bottomRow = !topRow && !middleRow;
        
        areaCoordinatesList[i] = { x: 0, y: 0, w: basePositions.left, h: basePositions.top};
        
        if (middleColumn) {
            areaCoordinatesList[i]!.x = basePositions.left;
            areaCoordinatesList[i]!.w = initialCoordinates.w;
        } 
        
        if (rightColumn) {
            areaCoordinatesList[i]!.x = basePositions.right;
        } 
        
        if (middleRow) {
            areaCoordinatesList[i]!.y = basePositions.top;
            areaCoordinatesList[i]!.h = initialCoordinates.h;
        }
        
        if (bottomRow) {
            areaCoordinatesList[i]!.y = basePositions.bottom;
            areaCoordinatesList[i]!.h = dimensions.heightPx - basePositions.bottom;
        }
    }
    const filteredAreaCoordinatesList: Coordinates[] = shuffle(areaCoordinatesList.filter((areaCoordinate) => areaCoordinate.w !== 0 && areaCoordinate.h !== 0)); // We're shuffling to make sur we get different areas covered if necessary
    const subTiles: Coordinates[] = [];
    
    const nbAreas = filteredAreaCoordinatesList.length;
    const nbAreasToCover = Math.round(nbAreas * tileCoverageRatio  )
    
    /* Then if we required a bigger tileDensity, we must divide those areas into tiles */
    if (tileDensity.A.min > 1 || tileDensity.A.max > 1 ||tileDensity.B.min > 1 || tileDensity.B.max > 1) {
        filteredAreaCoordinatesList.forEach((areaCoordinates, index) => {
            if (index > nbAreasToCover) {
                subTiles.push(areaCoordinates);
                return; 
            }
            
            /* 1st step is to calculate the proportion each tile should take (creates a repartition) */
            const { nbRows, nbColumns } = getNbRowsAndColumnsForFormat(
                randomInt(tileDensity.A.min, tileDensity.A.max) || 0, 
                randomInt(tileDensity.B.min, tileDensity.B.max) || 0, 
                { widthPx: areaCoordinates.w, heightPx: areaCoordinates.h }, 
                tileFormat
            );
            const XEasingFunc =  (tileEasing.X && tileEasing.X in Transitions.easings ? Transitions.easings[tileEasing.X] : Transitions.easings.linear) || function (x: number) { return x; };
            const YEasingFunc = (tileEasing.Y in Transitions.easings ? Transitions.easings[tileEasing.Y] : Transitions.easings.linear)  || function (x: number) { return x; };

            const tiles: Array<{x: number, y: number}> = [];
            for (let i = 0; i < nbRows; i++) {
                for (let j = 0; j < nbColumns; j++) {
                    const columnI = j;
                    const rowI = i;
                    const x = Math.ceil(areaCoordinates.w * XEasingFunc(columnI / nbColumns));
                    const y = Math.ceil(areaCoordinates.h *  YEasingFunc(rowI / nbRows));
                    tiles.push({ 
                        x: areaCoordinates.x + x, 
                        y: areaCoordinates.y + y
                    });
                }
            }
            
            const nbTiles = tiles.length;
            tiles.forEach((subTileCoord, i) => {
                const tileNum = i + 1;
                const nextTileX = tileNum % nbColumns > 0 ? tiles[i + 1]: null;
                const nextTileY = i + nbColumns < nbTiles ? tiles[i + nbColumns]: null;
                
                const subTileBounds = {
                    x: nextTileX ? nextTileX.x : areaCoordinates.x + areaCoordinates.w,
                    y: nextTileY ? nextTileY.y : areaCoordinates.y + areaCoordinates.h,
                }
                
                subTiles.push({
                    x: subTileCoord.x,
                    y: subTileCoord.y,
                    w: subTileBounds.x - subTileCoord.x,
                    h: subTileBounds.y - subTileCoord.y
                });
            });
        });
    }
    
    return (subTiles.length ? subTiles : filteredAreaCoordinatesList).map((tile) => ({
        w: clamp(tile.w, 0, dimensions.widthPx),
        h: clamp(tile.h, 0, dimensions.heightPx),
        x: clamp(tile.x, 0, dimensions.widthPx),
        y: clamp(tile.y, 0, dimensions.heightPx),
    })).filter((tile) => tile.w > 0 && tile.h > 0);
}

function getNbRowsAndColumnsForFormat(tileDensityA: number, tileDensityB: number, tileDimensions: { widthPx: number, heightPx: number }, tileFormat?: string) {
    switch (tileFormat) {
        case 'random':
        const random = Math.random() > Math.random();
        return {
            nbRows: random ? tileDensityA : tileDensityB,
            nbColumns: random ? tileDensityB : tileDensityA,
        }
        case 'portrait':
        return {
            nbRows: tileDensityA,
            nbColumns: tileDensityB,
        }
        case 'landscape':
        return {
            nbRows: tileDensityB,
            nbColumns: tileDensityA,
        }
        default:
        return {
            nbRows: tileDimensions.widthPx > tileDimensions.heightPx ? tileDensityA : tileDensityB,
            nbColumns: tileDimensions.widthPx > tileDimensions.heightPx ? tileDensityB : tileDensityA,
        }
    }
}


function createSharpOverlaysFromCoordinatesList(
    tileCoordinatesList: Coordinates[], 
    colorPalette: [number, number, number][],
): sharp.OverlayOptions[] {

    let usedColorsIndexes: number[] = [];
    const colorPaletteLength = colorPalette.length;

    const getUnusedColorIndex = () => {
        const paletteIndex = randomInt(0, colorPaletteLength) || 0;
        resetUnusedColorIndexesIfNeeded();

        if (usedColorsIndexes.includes(paletteIndex)) {
            return getUnusedColorIndex();
        }

        usedColorsIndexes.push(paletteIndex);
        return paletteIndex;
    }

    const resetUnusedColorIndexesIfNeeded = () => {
        if (usedColorsIndexes.length !== colorPaletteLength) {
            return;
        }
        usedColorsIndexes = [];
    }

    const sharpOverlays: sharp.OverlayOptions[] = [];

    tileCoordinatesList.forEach((tileCoordinates) => {
        const colorPaletteIndex = getUnusedColorIndex();
        const RGBColor = colorPalette[colorPaletteIndex];
        if (!RGBColor) {
            return;
        }
        sharpOverlays.push({
            top: Math.floor(tileCoordinates.y),
            left: Math.floor(tileCoordinates.x),
            input: {
                create: {
                    width: Math.round(tileCoordinates.w),
                    height: Math.round(tileCoordinates.h),
                    channels: 4,
                    background: {
                        r: RGBColor[0],
                        g: RGBColor[1],
                        b: RGBColor[2],
                        alpha: 1
                    }
                }
            }
        });
    })

    return sharpOverlays;
}
