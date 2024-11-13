export function random (bound1?: number): number | undefined
export function random (bound1?: number, bound2?: number | undefined): number | undefined
export function random (bound1: number = 1, bound2?: number | undefined): number | undefined {
  const min = bound2 === undefined ? 0 : bound1
  const max = bound2 === undefined ? bound1 : bound2
  if (min === max || min > max) return undefined
  const range = max - min
  return (Math.random() * range) + min
}

export function randomInt (...args: Parameters<typeof random>): number | undefined {
  const rand = random(...args)
  return rand !== undefined ? Math.floor(rand) : undefined
}
