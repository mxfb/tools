function toHEX (color: number): string {
    const hex = color.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
}

export function RGBToHEX(color: [number, number, number]) {
    return `#${toHEX(color[0])}${toHEX(color[1])}${toHEX(color[2])}`;
}