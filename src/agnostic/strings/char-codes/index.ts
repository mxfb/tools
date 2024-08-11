export namespace CharCodes {
  export type CharCode = number
  export type B36CharCode = string

  // CharCode to/from B36CharCode

  export function charCodeToB36 (charCode: CharCode): B36CharCode {
    if (charCode === null) return '\x00'
    return charCode.toString(36)
  }

  export function b36CharCodeToCharCode (b36CharCode: B36CharCode): CharCode {
    if (b36CharCode === null) return 0
    const charCode = parseInt(b36CharCode, 36)
    if (!Number.isInteger(charCode)) return 0
    return charCode
  }

  // Char to
  
  export function charToCharCode (char: string): CharCode {
    const charCode = char.charCodeAt(0)
    if (!Number.isInteger(charCode)) return 0
    return charCode
  }

  export function charToB36CharCode (char: string): B36CharCode {
    const charCode = charToCharCode(char)
    return charCodeToB36(charCode)
  }

  // Char from

  export function charFromCharCode (charCode: CharCode): string {
    return String.fromCharCode(charCode)
  }

  export function charFromB36CharCode (b36CharCode: B36CharCode): string {
    const charCode = parseInt(b36CharCode, 36)
    if (!Number.isInteger(charCode)) return '\x00'
    return charFromCharCode(charCode)
  }

  // String to

  export function toCharCodes (string: string): Array<CharCode> {
    const chars = string.split('')
    return chars.map(charToCharCode)
  }

  export function toB36CharCodes (string: string): Array<B36CharCode> {
    const chars = string.split('')
    return chars.map(charToB36CharCode)
  }

  // String from

  export function fromCharCodes (charCodes: Array<CharCode>): string {
    return charCodes
      .map(charFromCharCode)
      .map(char => char === null ? '\x00' : char)
      .join('')
  }

  export function fromB36CharCodes (b36CharCodes: Array<B36CharCode>): string {
    return b36CharCodes
      .map(charFromB36CharCode)
      .map(char => char === null ? '\x00' : char)
      .join('')
  }

  // Serialization

  export function serialize (charCodes: Array<CharCode | B36CharCode>): string {
    return charCodes
      .map(c => typeof c === 'string' ? c : charCodeToB36(c))
      .join(',')
  }

  export function deserialize (serializedCharCodes: string): Array<CharCode> {
    const b36CharCodes = serializedCharCodes.split('')
    return b36CharCodes.map(b36CharCodeToCharCode)
  }

  export function fromSerialized (serializedCharCodes: string): string {
    const charCodes = deserialize(serializedCharCodes)
    return fromCharCodes(charCodes)
  }
}
