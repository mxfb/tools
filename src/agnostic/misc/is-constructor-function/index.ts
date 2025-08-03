export type ConstructorFunction<T extends any = any> = new (...args: any[]) => T

export function isConstructorFunction (input: unknown): input is ConstructorFunction {
  if (typeof input !== 'function') return false
  return 'prototype' in input
    && 'constructor' in input.prototype
}
