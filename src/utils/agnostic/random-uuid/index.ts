export const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

export function randomHexChar (): string {
  const nbr = Math.floor(Math.random() * 16)
  const char = hexChars[nbr]
  return char as string
}

export function randomHash (length: number = 4) {
  return new Array(length)
    .fill(null)
    .map(e => randomHexChar())
    .join('')
}

export function randomHashPattern (pattern: number[], joiner: string = '-'): string {
  return pattern.map(length => randomHash(length))
    .join(joiner)
}

export default function randomUUID () {
  return randomHashPattern([8, 4, 4, 4, 12])
}
