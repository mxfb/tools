export function timeoutCall<T extends any> (callback: () => T, timeoutMs: number) {
  return new Promise(async (resolve, reject) => {
    const rejectTimeout = setTimeout(() => reject(false), timeoutMs)
    const callbackResult = await callback()
    clearTimeout(rejectTimeout)
    return resolve(callbackResult)
  })
}
