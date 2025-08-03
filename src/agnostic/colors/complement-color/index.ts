export function complementColor(color: [number, number, number]): [number, number, number] {
    const r = 255 - color[0];
    const g = 255 - color[1];
    const b = 255 - color[2];
    return [r, g, b];
}