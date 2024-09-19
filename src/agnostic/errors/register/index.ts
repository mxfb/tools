import { Outcome } from '~/agnostic/misc/outcome'

export namespace Register {
  export type RegisterEntry = {
    message: string
    detailsMaker: (...params: any[]) => any
  }
  
  export function from<Source extends { [k: string]: RegisterEntry }> (source: Source) {
    type RegisterKeys = keyof Source
    type Message<Code extends RegisterKeys> = Source[Code]['message']
    type DetailsMaker<Code extends RegisterKeys> = Source[Code]['detailsMaker']
    type DetailsMakerParams<Code extends RegisterKeys> = Parameters<DetailsMaker<Code>>
    type Details<Code extends RegisterKeys> = ReturnType<DetailsMaker<Code>>

    function getMessage<Code extends RegisterKeys> (code: Code): Message<Code> {
      const message = source[code]!.message
      return message
    }

    function getDetailsMaker<Code extends RegisterKeys> (code: Code): DetailsMaker<Code> {
      const maker = source[code]!.detailsMaker as DetailsMaker<Code>
      return maker
    }

    function getDetails<Code extends RegisterKeys> (code: Code, ...params: DetailsMakerParams<Code>): Details<Code> {
      const maker = getDetailsMaker(code) as undefined | ((...p: any[]) => any)
      const details = maker?.(...params)
      return details
    }

    function getFailureOutcome<Code extends RegisterKeys> (code: Code, ...params: DetailsMakerParams<Code>): Outcome.Failure<Code, Message<Code>, Details<Code>> {
      const message = getMessage(code)
      const details = getDetails(code, ...params)
      return Outcome.makeFailure(code, message, details)
    }

    class CustomError<Code extends RegisterKeys> extends Error {
      code: Code
      details: Details<Code>
      constructor (code: Code, ...params: DetailsMakerParams<Code>) {
        super(getMessage(code))
        const details = getDetails(code, ...params)
        this.code = code
        this.details = details
      }
    }

    function getError<Code extends RegisterKeys> (code: Code, ...params: DetailsMakerParams<Code>): CustomError<Code> {
      return new CustomError(code, ...params)
    }

    return {
      getMessage,
      getDetailsMaker,
      getDetails,
      getError,
      getFailureOutcome,
      CustomError,
      source
    }
  }
}
