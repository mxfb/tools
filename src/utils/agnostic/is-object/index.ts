export default function isObject (unk: unknown): unk is object {
  return typeof unk === 'object'
    && unk !== null
}
