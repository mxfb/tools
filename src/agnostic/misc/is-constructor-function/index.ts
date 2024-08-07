export type ConstructorFunction = new (...args: any[]) => any

export function isConstructorFunction (input: unknown): input is ConstructorFunction {
  if (typeof input !== 'function') return false
  return 'prototype' in input
    && 'constructor' in input.prototype
}
