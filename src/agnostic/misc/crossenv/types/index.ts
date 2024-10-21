export namespace Types {
  export enum RuntimeName {
    NODE = 'Node.js',
    BROWSER = 'Browser',
    DENO = 'Deno',
    REACT_NATIVE = 'React Native',
    ELECTRON = 'Electron',
    CLOUDFLARE = 'Cloudflare Workers',
    AWS_LAMBDA = 'AWS Lambda'
  }
  
  export interface MinimalWindow {
    Node: typeof Node
    Element: typeof Element
    Text: typeof Text
    NodeList: typeof NodeList
    Attr: typeof Attr
    document: Document
  }
  
}
