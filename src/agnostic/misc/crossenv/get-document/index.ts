import { getWindow } from '../get-window'
import { GetWindowReturnType } from '../types'

export async function getDocument (): Promise<GetWindowReturnType['document']> {
  const window = await getWindow()
  return window.document
}
