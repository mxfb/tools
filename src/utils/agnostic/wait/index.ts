export default async function wait (durationMs: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(true), durationMs)
  })
}
