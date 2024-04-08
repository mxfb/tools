export const regex = /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/

export default function isValidClassName (string: string): boolean {
  return regex.test(string)
}
