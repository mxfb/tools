export function unknownToString (err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (typeof err === 'object' && err !== null) return JSON.stringify(err)
  return `${err}`
}
