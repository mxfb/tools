export const classNameRegex = /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/

export function isValidClassName (string: string): boolean {
  return classNameRegex.test(string)
}
