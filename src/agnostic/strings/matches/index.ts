export function matches (input: string, matcher: string | RegExp): boolean {
  if (typeof matcher === 'string') return input === matcher
  return input.match(matcher) !== null
}

export function matchesSome (input: string, matchers: string | RegExp | Array<string | RegExp>): boolean {
  if (!Array.isArray(matchers)) return matches(input, matchers)
  return matchers.some(matcher => matches(input, matcher))
}

export function matchesEvery (input: string, matchers: string | RegExp | Array<string | RegExp>): boolean {
  if (!Array.isArray(matchers)) return matches(input, matchers)
  return matchers.every(matcher => matches(input, matcher))
}
