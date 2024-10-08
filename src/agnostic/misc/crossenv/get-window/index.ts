import { JSDOM } from 'jsdom'
import { GetWindowReturnType } from '../types'

export function getWindow (): GetWindowReturnType {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
  return dom.window
}
