import { getWindow } from '../get-window'
import { GetWindowReturnType } from '../types'

export function getDocument (): GetWindowReturnType['document'] {
  const window = getWindow()
  return window.document
}
