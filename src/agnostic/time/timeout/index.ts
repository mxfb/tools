export function timeout<T> (timeoutMs: number, callback: () => T): Promise<T> {
  let hasRejected = false
  return new Promise(async (resolve, reject) => {
    const rejectTimeout = setTimeout(() => {
      reject(false)
      hasRejected = true
    }, timeoutMs)
    const callbackResult = await callback()
    if (hasRejected) return
    clearTimeout(rejectTimeout)
    return resolve(callbackResult)
  })
}
