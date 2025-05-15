// import { clamp } from "agnostic/numbers/clamp";
// import { randomInt } from "agnostic/random/random";
// import { shuffle } from "agnostic/arrays/shuffle";
// import {  Transitions } from "agnostic/time/transitions";

// export type Dimensions = { w: number, h: number };
// export type Positions = { x: number, y: number };
// export type Layout = Dimensions & Positions;
// export type Tiles = Array<Layout>;
// export type TileDensity = { min: number, max: number };
// export type TileEasing = { X: string, Y: string };

// /* Déplacer dans agnostic */
// export function getContainedDimensions(w: number, h: number, wrapperW: number, wrapperH: number, ignoreIfSmaller?: boolean) {
//     if (ignoreIfSmaller && w <= wrapperW && h <= wrapperH) {
//         return { w, h };
//     }
    
//     const wrapperRatio = wrapperW / wrapperH;
//     const imgRatio = w / h;
//     const containRatio = imgRatio > wrapperRatio ? wrapperW / w : wrapperH / h;
    
//     return { 
//         w: Math.round(w * containRatio), 
//         h: Math.round(h * containRatio) 
//     };
// }


// export function packAreasAndTiles(initialShape: Layout, dimensions: Dimensions, tileCoverage: number, tileDensity: { A: TileDensity, B: TileDensity }, tileEasing: TileEasing,  tileFormat?: string): Tiles {
//     // Considering our image as our first shape that we can't overlap
//     const areas: Tiles  = [];
    
//     const basePositions = {
//         top: Math.ceil(initialShape.y),
//         bottom: Math.ceil(initialShape.y + initialShape.h),
//         left:  Math.ceil(initialShape.x),
//         right:  Math.ceil(initialShape.x + initialShape.w),
//     }
    
//     for (let i = 0; i < 9; i++) {
//         if ( i === 4 ) { continue; }
//         const middleColumn = i % 3 === 1;
//         const rightColumn = i % 3 === 2;
        
//         const topRow = i < 3;
//         const middleRow = !topRow && i < 6;
//         const bottomRow = !topRow && !middleRow;
        
//         areas[i] = { x: 0, y: 0, w: basePositions.left, h: basePositions.top};
        
//         if (middleColumn) {
//             areas[i]!.x = basePositions.left;
//             areas[i]!.w = initialShape.w;
//         } 
        
//         if (rightColumn) {
//             areas[i]!.x = basePositions.right;
//         } 
        
//         if (middleRow) {
//             areas[i]!.y = basePositions.top;
//             areas[i]!.h = initialShape.h;
//         }
        
//         if (bottomRow) {
//             areas[i]!.y = basePositions.bottom;
//             areas[i]!.h = dimensions.h - basePositions.bottom;
//         }
//     }
//     const filteredAreas = shuffle(areas.filter((area) => area.w !== 0 && area.h !== 0)); // We're shuffling to make sur we get different areas covered if necessary
//     const subTiles: Tiles = [];
    
//     const nbAreas = filteredAreas.length;
//     const nbAreasToCover = Math.round(nbAreas * tileCoverage / 100 )
    
//     /* Then if we required a bigger tileDensity, we must divide those areas into tiles */
//     if (tileDensity.A.min > 1 || tileDensity.A.max > 1 ||tileDensity.B.min > 1 || tileDensity.B.max > 1) {
//         filteredAreas.forEach((area, areaI) => {
//             if (areaI > nbAreasToCover) {
//                 subTiles.push(area);
//                 return; 
//             }
            
//             /* 1st step is to calculate the proportion each tile should take (creates a repartition) */
//             const { nbRows, nbColumns } = getNbRowsAndColumnsForFormat(randomInt(tileDensity.A.min, tileDensity.A.max), randomInt(tileDensity.B.min, tileDensity.B.max), area, tileFormat);
//             const tiles: Array<{x: number, y: number}> = [];
//             for (let i = 0; i < nbRows; i++) {
//                 for (let j = 0; j < nbColumns; j++) {
//                     const columnI = j;
//                     const rowI = i;
//                     const x = Math.ceil(area.w * Transitions.easings['ease-in-back'](columnI / nbColumns, tileEasing.X));
//                     const y = Math.ceil(area.h *  ease(rowI / nbRows, tileEasing.Y));
//                     tiles.push({ 
//                         x: area.x + x, 
//                         y: area.y + y
//                     });
//                 }
//             }
            
//             const nbTiles = tiles.length;
//             tiles.forEach((subTileCoord, i) => {
//                 const tileNum = i + 1;
//                 const nextTileX = tileNum % nbColumns > 0 ? tiles[i + 1]: null;
//                 const nextTileY = i + nbColumns < nbTiles ? tiles[i + nbColumns]: null;
                
//                 const subTileBounds = {
//                     x: nextTileX ? nextTileX.x : area.x + area.w,
//                     y: nextTileY ? nextTileY.y : area.y + area.h,
//                 }
                
//                 subTiles.push({
//                     x: subTileCoord.x,
//                     y: subTileCoord.y,
//                     w: subTileBounds.x - subTileCoord.x,
//                     h: subTileBounds.y - subTileCoord.y
//                 });
//             });
//         });
//     }
    
//     return (subTiles.length ? subTiles : filteredAreas).map((tile) => ({
//         w: clamp(tile.w, 0, dimensions.w),
//         h: clamp(tile.h, 0, dimensions.h),
//         x: clamp(tile.x, 0, dimensions.w),
//         y: clamp(tile.y, 0, dimensions.h),
//     })).filter((tile) => tile.w > 0 && tile.h > 0);
// }

// function getNbRowsAndColumnsForFormat(tileDensityA: number, tileDensityB: number, tileDimensions: Dimensions, tileFormat?: string) {
//     switch (tileFormat) {
//         case 'random':
//         const random = Math.random() > Math.random();
//         return {
//             nbRows: random ? tileDensityA : tileDensityB,
//             nbColumns: random ? tileDensityB : tileDensityA,
//         }
//         case 'portrait':
//         return {
//             nbRows: tileDensityA,
//             nbColumns: tileDensityB,
//         }
//         case 'landscape':
//         return {
//             nbRows: tileDensityB,
//             nbColumns: tileDensityA,
//         }
//         default:
//         return {
//             nbRows: tileDimensions.w > tileDimensions.w ? tileDensityA : tileDensityB,
//             nbColumns: tileDimensions.w > tileDimensions.h ? tileDensityB : tileDensityA,
//         }
//     }
// }

// function getTileDivideInHeight(dimensions: Dimensions, tileDimensions: Dimensions, tileFormat?: string) {
//     switch (tileFormat) {
//         case 'random':
//         return Math.random() > Math.random();
//         case 'grid-format-smallest':
//         return tileDimensions.h > tileDimensions.w;
//         case 'grid-format':
//         return tileDimensions.h < tileDimensions.w;
//         case 'output-format-smallest':
//         return dimensions.h > dimensions.w;
//         case 'output-format':
//         return dimensions.h < dimensions.w;
//     }
// }

// export function alignTopLeft(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return {
//         x: alignHorizontalLeft(dimensions, containedDimensions, wrapperDimensions),
//         y: alignVerticalTop(dimensions, containedDimensions, wrapperDimensions)
//     }
// }

// export function alignTopCenter(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return {
//         x: alignHorizontalCenter(dimensions, containedDimensions, wrapperDimensions),
//         y: alignVerticalTop(dimensions, containedDimensions, wrapperDimensions)
//     };
// }

// export function alignTopRight(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return {
//         x: alignHorizontalRight(dimensions, containedDimensions, wrapperDimensions),
//         y: alignVerticalTop(dimensions, containedDimensions, wrapperDimensions)
//     };
// }

// export function alignLeftCenter(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return {
//         x: alignHorizontalLeft(dimensions, containedDimensions, wrapperDimensions),
//         y: alignVerticalCenter(dimensions, containedDimensions, wrapperDimensions),
//     };
// }

// export function alignRightCenter(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return {
//         x: alignHorizontalRight(dimensions, containedDimensions, wrapperDimensions),
//         y: alignVerticalCenter(dimensions, containedDimensions, wrapperDimensions),
//     };
// }

// export function alignCenter(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return {
//         x: alignHorizontalCenter(dimensions, containedDimensions, wrapperDimensions),
//         y: alignVerticalCenter(dimensions, containedDimensions, wrapperDimensions),
//     };
// }

// export function alignBottomLeft(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return {
//         x: alignHorizontalLeft(dimensions, containedDimensions, wrapperDimensions),
//         y: alignVerticalBottom(dimensions, containedDimensions, wrapperDimensions),
//     }
// }

// export function alignBottomCenter(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return {
//         x: alignHorizontalCenter(dimensions, containedDimensions, wrapperDimensions),
//         y: alignVerticalBottom(dimensions, containedDimensions, wrapperDimensions),
//     };
// }

// export function alignBottomRight(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return {
//         x: alignHorizontalRight(dimensions, containedDimensions, wrapperDimensions),
//         y: alignVerticalBottom(dimensions, containedDimensions, wrapperDimensions),
//     };
// }

// function alignHorizontalLeft(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return getOffset(dimensions.w, containedDimensions.w);
// }
// function alignHorizontalCenter(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return getOffset(dimensions.w, wrapperDimensions.w);
// }
// function alignHorizontalRight(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return wrapperDimensions.w - (dimensions.w - getOffset(containedDimensions.w, dimensions.w));
// }
// function alignVerticalTop(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return getOffset(dimensions.h, containedDimensions.h);
// }
// function alignVerticalCenter(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return getOffset(dimensions.h, wrapperDimensions.h);
// }
// function alignVerticalBottom(dimensions: Dimensions, containedDimensions: Dimensions, wrapperDimensions: Dimensions) {
//     return wrapperDimensions.h - (dimensions.h - getOffset(containedDimensions.h, dimensions.h));
// }

// export function getOffset(size: number, wrapperSize: number) {
//     return (wrapperSize - size) / 2;
// }