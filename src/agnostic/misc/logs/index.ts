import { Logger as LoggerClass } from './logger'
import { makeTextBlock as makeTextBlockFunc } from './make-text-block'
import { styles as stylesObj } from './styles'


export namespace Logs {
  export const makeTextBlock = makeTextBlockFunc
  export const styles = stylesObj
  export const Logger = LoggerClass  
}
