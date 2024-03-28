import path from 'node:path'

// ROOT
export const CWD = process.cwd()
export const PKG_JSON = path.join(CWD, 'package.json')
export const LIB = path.join(CWD, 'lib')
export const SRC = path.join(CWD, 'src')

// lib
export const LIB_INDEX = path.join(LIB, 'index.js')
export const LIB_PKG_JSON = path.join(LIB, 'package.json')

// src
export const COMPONENTS = path.join(SRC, 'components')
export const UTILS = path.join(SRC, 'utils')

// src/utils
export const UTILS_AGNOSTIC = path.join(UTILS, 'agnostic')
export const UTILS_BROWSER = path.join(UTILS, 'browser')
export const UTILS_NODE = path.join(UTILS, 'node')

