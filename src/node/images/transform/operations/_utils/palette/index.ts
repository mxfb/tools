import quantize from 'quantize';

export type Palette = Color[];
export type Color = [number, number, number];
export type RGBColor = Color;
export type HSLColor = Color;
export type PaletteExtract = {
    default: {
        default: Palette,
        saturate: Palette,
        lighten: Palette,
    },
    complementary: {
        default: Palette,
        saturate: Palette,
        lighten: Palette,
    }
}

export function extractPaletteFromImage(data: Buffer<ArrayBufferLike>, imageDimensions: { w: number, h: number }, additionalColors: Palette, options: {
    useAdditionalColorsOnly: boolean,
    extractDensity: number,
    lightenIntensity: number,
    saturateIntensity: number,
}, nbChannels: number = 3): PaletteExtract {
    const pixels = getPixels(data, imageDimensions.w, imageDimensions.h, nbChannels);
    const palette = additionalColors.length && options.useAdditionalColorsOnly ? additionalColors : getPalette(pixels, options.extractDensity);
    const complementaryPalette = palette.map((color) => complementColor(color));

    return {
        default: {
            default: palette,
            saturate: palette.map((color) => saturateColor(color, options.saturateIntensity)),
            lighten: palette.map((color) => lightenColor(color, options.lightenIntensity)),
        },
        complementary: {
            default: complementaryPalette,
            saturate: complementaryPalette.map((color) => saturateColor(color, options.saturateIntensity)),
            lighten: complementaryPalette.map((color) => lightenColor(color, options.lightenIntensity)),
        }
    }
}

export const getPixel = (data: Buffer<ArrayBufferLike>, x: number, y: number, width: number, nbChannels: number): RGBColor => {
    /* 
        In a buffer each pixel is stored as (considering 3 channels) : 
        x=0, y=0 = data[0], data[1], data[2]
        x=1, y=0 = data[3], data[4], data[5]
        x=2, y=0 = data[6], data[7], data[8]
    */

    /* Knowing this, we calculate the index in the data buffer matching this pixel */
    const index = nbChannels * (width * y + x); 
    const r =  data[index] || 0;
    const g =  data[index + 1] || 0;
    const b =  data[index + 2] || 0;

    return [r, g, b];
}

export const getPixels = (data: Buffer<ArrayBufferLike>, width: number, height: number, nbChannels: number = 3) => {
    const pixels: Color[] = []; 

    /* We loop through each pixel in X + Y to get the RGB matching the pixel */
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const pixel = getPixel(data, i, j, width, nbChannels);
            pixels.push(pixel);
        }
    } 
    return pixels;
}

export const getPalette = (pixels: Color[], paletteDensity: number): Palette => {
    /* Uses quantization to calc palette */
    const _paletteDensity = Math.max(1, paletteDensity < 5 ? paletteDensity - 1 : paletteDensity);
    const colorMap = quantize(pixels, _paletteDensity);
    const palette: Color[] = colorMap ? colorMap.palette() : [];
    return palette;
}