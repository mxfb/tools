// import sharp from "sharp";

// export type ColorTransformation = {
//     type: 'saturate' | 'lighten' | 'complement',
//     intensity: number,
//     intensityMode: 'add' | 'set'
// }

// export type LineAreaComposition = {
//     type: 'line',
//     params: {
//         nbLines: number,
//         colors: {
//             base: 'first' | 'last' | number,
//             primary: ColorTransformation[],
//             secondary: ColorTransformation[]
//         }
//     };
// };

// export const DEFAULT_COMPOSITION_LINE_PARAMS: LineAreaComposition['params'] = {
//     nbLines: 3,
//     colors: {
//         base: 'first',
//         primary: [],
//         secondary: []
//     }
// }; 

// export async function areaLineCompose(inputSharp: sharp.Sharp, composition: LineAreaComposition, options: CompositionOptions): Promise<sharp.OverlayOptions[]> {
//     // Dividing zones into N* Lines
//     const lineDimensions = {
//         w: options.outputDimensions.w,
//         h: Math.round(options.outputDimensions.h / composition.params.nbLines) 
//     }
//     const sharpShapes: SharpInput[] = [];

//     const maxPaletteLength = options.palette.length;
//     const baseColorIndex = composition.params.colors.base === 'first' ? 0 : composition.params.colors.base === 'last' ? options.palette.length - 1 : composition.params.colors.base;
//     for (let i = 0; i < composition.params.nbLines; i++) {
//         const indexPalette = Math.min(Math.max(0, baseColorIndex), maxPaletteLength);

//         const primaryColor = getTransformedColor(options.palette[indexPalette], composition.params.colors.primary);
//         const secondaryColor = getTransformedColor(options.palette[indexPalette], composition.params.colors.secondary);

//         const outputColor = i % 2 === 0 ? primaryColor : secondaryColor;

//         const top = Math.min(lineDimensions.h * i,  options.outputDimensions.h);
//         sharpShapes.push({
//             input: {
//                 create: {
//                     width: lineDimensions.w,
//                     height: i === composition.params.nbLines - 1 ? options.outputDimensions.h - top : lineDimensions.h,
//                     channels: 4,
//                     background: { r: outputColor[0], g: outputColor[1], b: outputColor[2], alpha: 1 }
//                 },
//             },
//             left: 0,
//             top: top
//         })
//     }

//     return [
//         ...sharpShapes,
//         {
//             input: await inputSharp.png({ quality: 100 }).toBuffer(), /* Converting to png to handle alpha */
//             left: 0,
//             top: 0,
//         },
//     ]
// }

// function getTransformedColor(color: Colors.Color, transformation: ColorTransformation[]) {
//     let transformedColor = color;
//     transformation.forEach((transformation) => {
//         transformedColor = transformColor(transformedColor, transformation);
//     });
//     return transformedColor;
// }

// function transformColor(color: Colors.Color, transformation: ColorTransformation) {
//     switch (transformation.type) {
//         case 'saturate':
//             return transformation.intensityMode === 'add' ? Colors.saturateColor(color, transformation.intensity) : Colors.setColorSaturation(color, transformation.intensity);
//         case 'lighten':
//             return transformation.intensityMode === 'add' ? Colors.lightenColor(color, transformation.intensity) : Colors.setColorLuminance(color, transformation.intensity);
//         case 'complement':
//             return Colors.complementColor(color);
//     }
// }