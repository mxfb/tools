export const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']

export function randomHexChar (): string {
  const nbr = Math.floor(Math.random() * 16)
  const char = hexChars[nbr]
  return char as string
}
