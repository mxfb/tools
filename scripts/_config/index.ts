import process from 'node:process'
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
export const AGNOSTIC = path.join(SRC, 'agnostic')
export const NODE = path.join(SRC, 'node')
