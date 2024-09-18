export namespace Outcome {
  export type Success<Payload extends any = any> = {
    success: true,
    payload: Payload
  }

  export type Failure<
    Code extends string = string,
    Msg extends string = string,
    Details extends any = any
  > = {
    success: false,
    code: Code,
    message: Msg,
    details?: Details
  }

  export type Outcome<
    Payload extends any = any,
    Code extends string = string,
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
    Code extends string = string,
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
}
