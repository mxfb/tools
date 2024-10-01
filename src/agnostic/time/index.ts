export namespace Time {
  export function secondsToMs (seconds: number) { return seconds * 1000 }
  export function minutesToMs (minutes: number) { return secondsToMs(60 * minutes) }
  export function hoursToMs (hours: number) { return minutesToMs(60 * hours) }
  export function daysToMs (days: number) { return hoursToMs(24 * days) }
  export function weeksToMs (weeks: number) { return daysToMs(7 * weeks) }
  export function monthsToMs (months: number) { return daysToMs(30 * months) }
  export function yearsToMs (years: number) { return daysToMs(365 * years) }
}
