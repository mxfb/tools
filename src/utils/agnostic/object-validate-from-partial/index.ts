import isObject from '~/utils/agnostic/is-object'

export default function validateScheme<T> (obj: T, scheme: Partial<T>): boolean {
  if (!isObject(obj)) return false
  return Object.entries(scheme).every(([key, val]) => {
    return obj[key as keyof Partial<T>] === val
  })
}
