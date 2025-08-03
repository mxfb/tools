export namespace Outcome {
  export type Success<Payload extends any = any> = { success: true, payload: Payload }
  export type Failure<Error extends any = any> = { success: false, error: Error }
  export type Either<Payload extends any = any, Error extends any = any> = Success<Payload> | Failure<Error>
  export function makeSuccess<Payload extends any> (payload: Payload): Success<Payload> { return { success: true, payload } }
  export function makeFailure<Error extends any> (error: Error): Failure<Error> { return { success: false, error } }
  export function make<Payload extends any> (success: true, payload: Payload): Success<Payload>
  export function make<Error extends any> (success: false, error: Error): Failure<Error>
  export function make<Payload extends any, Error extends any> (success: boolean, payloadOrError: Payload | Error) {
    return success
      ? makeSuccess(payloadOrError as Payload)
      : makeFailure(payloadOrError as Error)
  }
}
