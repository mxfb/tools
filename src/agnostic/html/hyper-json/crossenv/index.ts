export namespace Crossenv {
  interface MinimalWindow {
    Node: typeof Node
    Element: typeof Element
    Text: typeof Text
    NodeList: typeof NodeList
    Attr: typeof Attr
    document: Document
  }

  let _window: MinimalWindow | undefined = undefined
  if (typeof globalThis !== 'undefined'
    && 'window' in globalThis
    && globalThis === globalThis.window) {
    _window = globalThis.window
  }

  export function setWindow (customWindow: MinimalWindow) { _window = customWindow }
  export function getWindow () {
    if (_window !== undefined) return _window
    const message = 'Window is undefined. Please call HyperJson.Crossenv.setWindow(windowObj) before using HyperJson.'
    throw new Error(message)
  }
}
