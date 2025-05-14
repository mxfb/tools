export function HEXToRGB(hexColor: string): [number, number, number] {
    hexColor = hexColor.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hexColor.substring(0, 2), 16))),
    g = Math.max(0, Math.min(255, parseInt(hexColor.substring(2, 4), 16))),
    b = Math.max(0, Math.min(255, parseInt(hexColor.substring(4, 6), 16)));

    return [r, g, b];
}