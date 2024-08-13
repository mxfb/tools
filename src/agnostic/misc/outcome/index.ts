import { Errors } from '../../errors'

export namespace Outcome {
  /* * * * * * * * * * * * * * * * * * * * * *
   *
   * OUTCOME
   *  
   * * * * * * * * * * * * * * * * * * * * * */

  export type Success<Payload = unknown> = {
    success: true
    returned: Payload
  }

  export type Failure<
    Payload = unknown,
    ErrorsIndex extends Errors.Index = { [key: string]: any }
  > = {
    success: false
    returned: Payload
    errorCode: keyof ErrorsIndex
  }

  export type Outcome<
    SuccesPayload = unknown,
    FailurePayload = SuccesPayload,
    ErrorsIndex extends Errors.Index = { [key: string]: any }
  > = Success<SuccesPayload> | Failure<FailurePayload, ErrorsIndex>

  export function makeSuccess<S = any> (returned: S): Success<S> {
    return {
      success: true,
      returned
    }
  }

  export function makeFailure<
    FailurePayload = any,
    ErrorsIndex extends Errors.Index = { [key: string]: any }
  > (returned: FailurePayload, code: keyof ErrorsIndex): Failure<FailurePayload, ErrorsIndex> {
    return {
      success: false,
      returned,
      errorCode: code
    }
  }

  export type Outcomer<
    SuccesPayload,
    FailurePayload,
    Params extends any[]
  > = (...params: Params) => Outcome<SuccesPayload, FailurePayload> | Promise<Outcome<SuccesPayload, FailurePayload>>
}
