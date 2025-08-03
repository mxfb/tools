import { Register as RegisterNamespace } from './register'
import { unknownToString as unknownToStringFunc } from './unknown-to-string'

export namespace Errors {
  export import Register = RegisterNamespace
  export const unknownToString = unknownToStringFunc
}
