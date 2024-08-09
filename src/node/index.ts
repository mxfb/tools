import { Files as FilesNamespace } from './files'
import { Process as ProcessNamespace } from './process'

export namespace Node {
  export import Files = FilesNamespace
  export import Process = ProcessNamespace
}
