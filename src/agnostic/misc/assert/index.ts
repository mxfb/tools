export namespace Assert {
  type Assertion = (() => boolean) | boolean

  function makeSuccess (label: string) {
    console.info(`✅ SUCCESS: "${label}"`)
  }

  function makeFailure (label: string) {
    throw new Error(`🚫 FAILURE: "${label}""`)
  }

  export function assert (label: string, assertion: Assertion | Array<Assertion>) {
    if (Array.isArray(assertion)) assertion.forEach((innerAssertion, pos) => assert(`${label} (${pos})`, innerAssertion))
    else if (typeof assertion === 'function') {
      try {
        const result = assertion()
        if (result === false) makeFailure(label)
        else makeSuccess(label)
      } catch (err) {
        makeFailure(`${err}`)
      }
    }
    else if (assertion === false) makeFailure(label)
    else makeSuccess(label)
  }

}
