export function getCurrentDownlink (): number | undefined {
  if (typeof window !== 'object') return undefined
  if (typeof window.navigator !== 'object') return undefined
  const navigator = window.navigator as any
  const connection = (
    navigator?.connection
    ?? navigator?.mozConnection
    ?? navigator?.webkitConnection
  ) as any
  return connection?.downlink
}
