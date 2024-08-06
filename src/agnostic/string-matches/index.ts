export default function stringMatches (input: string, matcher: string | RegExp): boolean {
  if (typeof matcher === 'string') return input === matcher
  return input.match(matcher) !== null
}

export { stringMatches }

export function stringMatchesSome (input: string, matchers: string | RegExp | Array<string | RegExp>): boolean {
  if (!Array.isArray(matchers)) return stringMatches(input, matchers)
  return matchers.some(matcher => stringMatches(input, matcher))
}

export function stringMatchesEvery (input: string, matchers: string | RegExp | Array<string | RegExp>): boolean {
  if (!Array.isArray(matchers)) return stringMatches(input, matchers)
  return matchers.every(matcher => stringMatches(input, matcher))
}
