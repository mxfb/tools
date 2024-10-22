export function interpolate (ratio: number, bound1: number, bound2: number): number {
  return bound1 + ratio * (bound2 - bound1)
}

// [WIP] that name... : S
export function exterpolate (value: number, bound1: number, bound2?: number) {
  if (bound2 === undefined) return value / bound1
  return (value - bound1) / (bound2 - bound1)
}
