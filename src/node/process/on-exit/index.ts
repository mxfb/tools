export const forceExitEvents = ['SIGINT', 'SIGTERM', 'uncaughtException']

export function beforeForcedExit (callback: () => void | Promise<void>) {
  forceExitEvents.forEach(ev => process.on(ev, callback))
}

export function beforeExit (callback: () => void | Promise<void>) {
  process.on('beforeExit', callback)
}

export function onExit (callback: () => void | Promise<void>) {
  process.on('exit', callback)
}

export function onAllExits (callback: () => void | Promise<void>) {
  let alreadyCalled = false
  const actualCallback = () => {
    if (!alreadyCalled) {
      alreadyCalled = true
      callback()
    }
  }
  beforeForcedExit(actualCallback)
  beforeExit(actualCallback)
  onExit(actualCallback)
}
