export const forceExitEvents = ['SIGINT', 'SIGTERM', 'uncaughtException']

export function beforeForcedExit (callback: () => void | Promise<void>) {
  forceExitEvents.forEach(ev => process.on(ev, callback))
}

export function beforeExit (callback: () => void | Promise<void>) {
  process.on('beforeExit', callback)
}
