import { Errors } from '@design-edito/tools/agnostic/errors'
import { Crossenv } from '@design-edito/tools/agnostic/misc/crossenv'

export enum Codes {
  NO_DOCUMENT = 'no-window-document-on-runtime',
  NO_DOCUMENT_PLEASE_PROVIDE = 'no-window-document-on-runtime-please-provide',

  IMPOSSIBLE_TO_PICK_IN_ARRAY = 'impossible-to-pick-in-array'
}

export const register = Errors.Register.from({
  [Codes.NO_DOCUMENT]:                {
    message: `Runtime '${Crossenv.detectRuntime()}' does not provide a Document object, cannot complete.`,
    detailsMaker: () => undefined
  },
  [Codes.NO_DOCUMENT_PLEASE_PROVIDE]: {
    message: `Please provide a Document object since none are found on runtime '${Crossenv.detectRuntime()}'`,
    detailsMaker: (tips?: string) => tips
  },
  [Codes.IMPOSSIBLE_TO_PICK_IN_ARRAY]: {
    message: 'Impossible to pick',
    detailsMaker: (array: any[]) => array.length === 0
      ? 'Array cannot be empty'
      : 'Too many exclusions'
  }
})
