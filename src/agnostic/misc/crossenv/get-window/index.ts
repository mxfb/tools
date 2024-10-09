import { GetWindowReturnType } from '../types'

export async function getWindow (): Promise<GetWindowReturnType> {
  if (window !== undefined) return window
  else {
    const { JSDOM } = await import('jsdom')
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    return dom.window
  }
}
