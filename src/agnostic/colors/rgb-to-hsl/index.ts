export function RGBToHSL(color: [number, number, number]): [number, number, number]{
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