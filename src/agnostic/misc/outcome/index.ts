export namespace Outcome {
  export type Success<Payload extends any = any> = {
    success: true,
    payload: Payload
  }

  export type Failure<
    Code extends any = any,
    Msg extends string = string,
    Details extends any = any
  > = {
    success: false,
    code: Code,
    message: Msg,
    details?: Details
  }

  export type Either<
    Payload extends any = any,
    Code extends any = any,
    Msg extends string = string,
    Details extends any = any
  > = Success<Payload> | Failure<Code, Msg, Details>

  export function makeSuccess<Payload extends any> (payload: Payload): Success<Payload> {
    return {
      success: true,
      payload
    }
  }

  export function makeFailure<
    Code extends any = any,
    Msg extends string = string,
    Details extends any | undefined = undefined
  > (code: Code, message: Msg, details?: Details): Failure<Code, Msg, Details> {
    return {
      success: false,
      code,
      message,
      details
    }
  }

  export function make<Payload extends any> (success: true, payload: Payload): Success<Payload>
  export function make<
    Code extends any = any,
    Msg extends string = string,
    Details extends any | undefined = undefined
  > (success: false, code: Code, message: Msg, details?: Details): Failure<Code, Msg, Details>
  export function make<
    Payload extends any,
    Code extends any = any,
    Msg extends string = string,
    Details extends any | undefined = undefined
  > (success: boolean, payloadOrCode: Payload | Code, message?: Msg, details?: Details) {
    if (success) return makeSuccess(payloadOrCode as Payload)
    return makeFailure(payloadOrCode as Code, message as Msg, details)
  }
}
