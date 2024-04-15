export type Callback<T> = () => T

export default function awaitTimeout<T extends any> (callback: Callback<T>, timeoutMs: number) {
  return new Promise(async (resolve, reject) => {
    const rejectTimeout = setTimeout(() => reject(false), timeoutMs)
    const callbackResult = await callback()
    clearTimeout(rejectTimeout)
    return resolve(callbackResult)
  })
}
