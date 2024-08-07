export namespace Regexps {
  export function mergeFlags (...flagStrs: string[]): string {
    const flagsSet = new Set<string>()
    flagStrs.forEach(flagStr => flagStr
      .split('')
      .forEach(char => flagsSet.add(char))
    )
    return [...flagsSet.values()].join('')
  }
  
  export function setFlags (regexp: RegExp, _flags: string): RegExp {
    const flags = mergeFlags(regexp.flags, _flags)
    return new RegExp(`${regexp.source}`, flags)
  }
  
  export function fromStart (regexp: RegExp, _flags: string = 'g'): RegExp {
    const flags = mergeFlags(regexp.flags, _flags)
    return new RegExp(`^(${regexp.source})`, flags)
  }
  
  export function toEnd (regexp: RegExp, _flags: string = 'g'): RegExp {
    const flags = mergeFlags(regexp.flags, _flags)
    return new RegExp(`(${regexp.source})$`, flags)
  }
  
  export function fromStartToEnd (regexp: RegExp, _flags: string = 'g'): RegExp {
    const flags = mergeFlags(regexp.flags, _flags)
    return fromStart(toEnd(regexp, flags), flags)
  }
  
  export function stringStartsWith (string: string, _regexp: RegExp): boolean
  export function stringStartsWith (string: string, _regexp: RegExp, returnMatches: true): RegExpMatchArray | null
  export function stringStartsWith (string: string, _regexp: RegExp, returnMatches: false): boolean
  export function stringStartsWith (string: string, _regexp: RegExp, returnMatches: false, _flags: string): boolean
  export function stringStartsWith (string: string, _regexp: RegExp, returnMatches: true, _flags: string): RegExpMatchArray | null
  export function stringStartsWith (string: string, _regexp: RegExp, returnMatches = true, _flags: string = 'g'): RegExpMatchArray | null | boolean {
    const regexp = fromStart(_regexp, _flags)
    return returnMatches ? string.match(regexp) : regexp.test(string)
  }
  
  export function stringEndsWith (string: string, _regexp: RegExp): boolean
  export function stringEndsWith (string: string, _regexp: RegExp, returnMatches: true): RegExpMatchArray | null
  export function stringEndsWith (string: string, _regexp: RegExp, returnMatches: false): boolean
  export function stringEndsWith (string: string, _regexp: RegExp, returnMatches: false, _flags: string): boolean
  export function stringEndsWith (string: string, _regexp: RegExp, returnMatches: true, _flags: string): RegExpMatchArray | null
  export function stringEndsWith (string: string, _regexp: RegExp, returnMatches = true, _flags: string = 'g'): RegExpMatchArray | null | boolean {
    const regexp = toEnd(_regexp, _flags)
    return returnMatches ? string.match(regexp) : regexp.test(string)
  }
  
  export function stringIs (string: string, _regexp: RegExp): boolean
  export function stringIs (string: string, _regexp: RegExp, returnMatches: true): RegExpMatchArray | null
  export function stringIs (string: string, _regexp: RegExp, returnMatches: false): boolean
  export function stringIs (string: string, _regexp: RegExp, returnMatches: false, _flags: string): boolean
  export function stringIs (string: string, _regexp: RegExp, returnMatches: true, _flags: string): RegExpMatchArray | null
  export function stringIs (string: string, _regexp: RegExp, returnMatches = false, _flags: string = 'g'): RegExpMatchArray | null | boolean {
    const regexp = fromStartToEnd(_regexp, _flags)
    return returnMatches ? string.match(regexp) : regexp.test(string)
  }
  
  export function fromStrings (strings: string[]): RegExp {
    const rootsMap = stringsToRootsMap(strings)
    const source = sourceFromRootsMap(rootsMap, false)
    const regexp = new RegExp(source)
    return regexp
  }
  
  function escape (string: string) {
    return string
      .replace(/\s/igm, '\\s')
      .replace(/\n/igm, '\\n')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
  
  type RootsMap = Map<string, { subRootsMap: RootsMap, isWordEnd: boolean }>
  
  function stringsToRootsMap (strings: string[], rootsMap: RootsMap = new Map()): RootsMap {
    const lengthSorted = strings.sort((strA, strB) => strA.length - strB.length)
    lengthSorted.forEach(string => {
      const [firstChar, ...lastChars] = string
      const isWordEnd = lastChars.length === 0
      if (firstChar === undefined) return
      const roots = [...rootsMap.keys()]
      const foundRoot = roots.find(root => new RegExp(`^(${escape(root)})`).test(string))
      const subRootsMap = foundRoot !== undefined
        ? rootsMap.get(foundRoot)?.subRootsMap
        : undefined
      if (foundRoot === undefined || subRootsMap === undefined) {
        const subRootsMap: RootsMap = new Map()
        stringsToRootsMap([lastChars.join('')], subRootsMap)
        return rootsMap.set(firstChar, { subRootsMap, isWordEnd })
      }
      stringsToRootsMap([lastChars.join('')], subRootsMap)
    })
    return rootsMap
  }
  
  function sourceFromRootsMap (
    rootsMap: RootsMap,
    isOptional: boolean
  ): string {
    const rootsMapEntries = [...rootsMap.entries()]
    if (rootsMapEntries.length === 0) return ''
    const regexpBody = rootsMapEntries.map(([root, rootData]) => {
      return `${escape(root)}${sourceFromRootsMap(
        rootData.subRootsMap,
        rootData.isWordEnd
      )}`
    }).join('|')
    return isOptional
      ? `(${regexpBody})?`
      : `(${regexpBody})`
  }  
}
