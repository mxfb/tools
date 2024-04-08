import detectRuntime, { RuntimeName } from '~/utils/agnostic/detect-runtime'

export default async function getDocument () {
  const runtime = detectRuntime()
  const runtimesWithGlobalWindow = [
    RuntimeName.BROWSER,
    RuntimeName.ELECTRON
  ]
  const runtimeHasGlobalWindow = runtimesWithGlobalWindow.includes(runtime as RuntimeName)
  window
  const document = runtimeHasGlobalWindow
    ? window.document
    : new (await import('jsdom')).JSDOM().window.document
  return document
}
