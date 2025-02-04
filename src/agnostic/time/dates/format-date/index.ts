// [WIP] how to handle "1er", "1st", "2nd", etc... ?
export function formatDate (date: Date, format: string, locale: string = 'en'): string {
  try { new Intl.DateTimeFormat(locale) }
  catch { locale = 'en' }
  const day = date.getDate()
  const dayOfWeek = date.getDay()
  const month = date.getMonth()
  const year = date.getFullYear()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const isPM = hours >= 12
  const shortDateNames = [...Array(7)].map((_, i) => new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2023, 0, i + 1)))
  const dateNames = [...Array(7)].map((_, i) => new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(new Date(2023, 0, i + 1)))
  const shortMonthNames = [...Array(12)].map((_, i) => new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2023, i, 1)))
  const monthNames = [...Array(12)].map((_, i) => new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2023, i, 1)))
  const replacements: { [key: string]: () => string } = {
    'DD': () => String(day).padStart(2, '0'),
    'D': () => String(day),
    'dd': () => dateNames[dayOfWeek]!,
    'd': () => shortDateNames[dayOfWeek]!,
    'MM': () => String(month + 1).padStart(2, '0'),
    'M': () => String(month + 1),
    'MMMM': () => monthNames[month]!,
    'MMM': () => shortMonthNames[month]!,
    'YYYY': () => String(year),
    'YY': () => String(year).slice(-2),
    'hh': () => String(hours % 12 || 12).padStart(2, '0'),
    'h': () => String(hours % 12 || 12),
    'HH': () => String(hours).padStart(2, '0'),
    'H': () => String(hours),
    'mm': () => String(minutes).padStart(2, '0'),
    'm': () => String(minutes),
    'ss': () => String(seconds).padStart(2, '0'),
    's': () => String(seconds),
    'A': () => (isPM ? 'PM' : 'AM'),
    'a': () => (isPM ? 'pm' : 'am')
  }

  return format.replace(/{{(DD|D|dd|d|MM|M|MMMM|MMM|YYYY|YY|HH|H|hh|h|mm|m|ss|s|A|a)}}/g, (match, token) => {
    return replacements[token]?.() || match
  })
}
