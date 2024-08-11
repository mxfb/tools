export function interpolate (ratio: number, bound1: number, bound2: number): number {
  return bound1 + ratio * (bound2 - bound1)
}
