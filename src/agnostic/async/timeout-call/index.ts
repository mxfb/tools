export function timeoutCall<T> (callback: () => T, timeoutMs: number): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const rejectTimeout = setTimeout(() => reject(false), timeoutMs)
    const callbackResult = await callback()
    clearTimeout(rejectTimeout)
    return resolve(callbackResult)
  })
}
