export function random (bound1: number): number
export function random (bound1: number, bound2: number | undefined): number
export function random (bound1: number = 1, bound2?: number | undefined) {
  const min = bound2 === undefined ? 0 : bound1
  const max = bound2 === undefined ? bound1 : bound2
  if (min === max || min > max) return NaN
  const range = max - min
  return (Math.random() * range) + min
}

export default random

export function randomInt (bound1: number = 1, bound2?: number) {
  const rand = random(bound1, bound2)
  return Math.floor(rand)
}

export const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

export function randomHexChar (): string {
  const nbr = Math.floor(Math.random() * 16)
  const char = hexChars[nbr]
  return char as string
}

export function randomHash (length: number = 4) {
  return new Array(length)
    .fill(null)
    .map(randomHexChar)
    .join('')
}

export function randomHashPattern (pattern: number[], joiner: string = '-'): string {
  return pattern.map(randomHash).join(joiner)
}

export function randomUUID () {
  return randomHashPattern([8, 4, 4, 4, 12])
}
