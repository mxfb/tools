import { isInDirectory as isInDirectoryFunc } from './is-in-directory'
import { ReadWriteEditorFunc as ReadWriteEditorFuncType, readWrite as readWriteFunc } from './read-write'
import { Subpaths as SubpathsNamespace } from './subpaths'

// Is in directory
export const isInDirectory = isInDirectoryFunc
  
// Read / write
export type ReadWriteEditorFunc = ReadWriteEditorFuncType
export const readWrite = readWriteFunc

// Subpaths
export import Subpaths = SubpathsNamespace
