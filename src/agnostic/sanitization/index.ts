import xss from 'xss'

export function sanitizeFileName (input: string, maxLength: number = 255): string | null {
  input = input
    .normalize('NFKC') // Normalize Unicode to avoid homoglyph attacks
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid characters (e.g., Windows and Unix forbidden characters)
    .trim() // Trim whitespace
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/\.+/g, '.') // Replace multiple dots with a single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
  if (input.length > maxLength) return null
  return input.length > 0 ? input : null
}

export function sanitizePath (targetPath: string): string | null {
  const sanitized = targetPath
    .split('/')
    .filter(chunk => chunk !== '')
    .map(chunk => sanitizeFileName(chunk) ?? '')
    .filter(chunk => chunk !== '' && chunk !== '..')
    .join('/')
  if (sanitized === '') return null
  return sanitized.startsWith('/')
    ? sanitized
    : `/${sanitized}`
}

export const sanitizeUserInput = <T>(input: T, seen = new WeakSet()): T => {
  if (typeof input === 'string') return xss(input) as T
  if (Array.isArray(input)) {
    if (seen.has(input)) return input
    seen.add(input)
    return input.map(item => sanitizeUserInput(item, seen)) as T
  }
  if (input !== null && typeof input === 'object') {
    if (seen.has(input)) return input
    seen.add(input)
    const entries = Object.entries(input as Record<string, unknown>)
    const sanitizedEntries = entries.map(([key, value]) => [xss(key), sanitizeUserInput(value, seen)])
    return Object.fromEntries(sanitizedEntries) as T
  }
  return input
}
