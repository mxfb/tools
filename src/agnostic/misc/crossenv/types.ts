import { DOMWindow } from 'jsdom'

export type CrossenvWindow = Window & typeof globalThis | DOMWindow
export type GetWindowReturnType = CrossenvWindow
