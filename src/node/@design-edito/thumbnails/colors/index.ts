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

export const toHex = (c: number): string => {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
}

export const RGBToHSL = (color: Color): HSLColor => {
    const r = color[0] / 255;
    const g = color[1] / 255;
    const b = color[2] / 255;

    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
        ? l === r
        ? (g - b) / s
        : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
        : 0;

    const outputH = 60 * h < 0 ? 60 * h + 360 : 60 * h;
    const outputS = 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0);
    const outputL = (100 * (2 * l - s)) / 2;

    return [outputH, outputS, outputL];
}

export const HSLToRGB = (color: Color): RGBColor => {
    const h = color[0];
    const s = color[1] / 100;
    const l = color[2] / 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    const r = Math.round(255 * f(0));
    const g = Math.round(255 * f(8));
    const b = Math.round(255 * f(4));
    return [r, g, b];
}

export const HEXToRGB = (hexColor: string): RGBColor => {
    const _hexColor = hexColor.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(_hexColor.substring(0, 2), 16)));
    const g = Math.max(0, Math.min(255, parseInt(_hexColor.substring(2, 4), 16)));
    const b = Math.max(0, Math.min(255, parseInt(_hexColor.substring(4, 6), 16)));

    return [r, g, b ]
}

export const RGBToHex = (color: RGBColor) => {
    return `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`;
}

export const complementColor = (color: RGBColor): RGBColor => {
    /* Complementary color is simple reverting color, knowing a r,g,b are on 255 scale */
    const [ r, g, b ] = color;

    const m = Math.min(r, g, b) + Math.max(r, g, b);
    return [m - r, m - g, m - b];
}

export const lightenColor = (color: RGBColor, intensity: number = 20): RGBColor => {
    /* To make it easier, we'll convert RGB to HSL so we just have to modify the L property */
    const [h, s, l] = RGBToHSL(color);

    const rgb = HSLToRGB([h, s, Math.min(100, l + intensity)]);
    return rgb;
}

export const saturateColor = (color: RGBColor, intensity: number = 20): RGBColor => {
    /* To make it easier, we'll convert RGB to HSL so we just have to modify the S property */
    const [h, s, l] = RGBToHSL(color);
    const rgb = HSLToRGB([h, Math.min(100, s + intensity), l]);
    return rgb;
}

export const setColorSaturation = (color: RGBColor, intensity: number = 20): RGBColor => {
    /* To make it easier, we'll convert RGB to HSL so we just have to modify the S property */
    const [h, s, l] = RGBToHSL(color);
    const rgb = HSLToRGB([h, Math.min(100, intensity), l]);
    return rgb;
}

export const setColorLuminance = (color: RGBColor, intensity: number = 20): RGBColor => {
    /* To make it easier, we'll convert RGB to HSL so we just have to modify the S property */
    const [h, s, l] = RGBToHSL(color);
    const rgb = HSLToRGB([h, s, Math.min(100, intensity)]);
    return rgb;
}