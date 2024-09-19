import { Outcome } from '~/agnostic/misc/outcome'

export namespace Register {
  export type RegisterEntry = {
    message: string
    detailsMaker: (...params: any[]) => any
  }

  export type RegisterKeys<Source extends { [k: string]: RegisterEntry }> = keyof Source
  export type Message<Source extends { [k: string]: RegisterEntry }, Code extends RegisterKeys<Source>> = Source[Code]['message']
  export type DetailsMaker<Source extends { [k: string]: RegisterEntry }, Code extends RegisterKeys<Source>> = Source[Code]['detailsMaker']
  export type DetailsMakerParams<Source extends { [k: string]: RegisterEntry }, Code extends RegisterKeys<Source>> = Parameters<DetailsMaker<Source, Code>>
  export type Details<Source extends { [k: string]: RegisterEntry }, Code extends RegisterKeys<Source>> = ReturnType<DetailsMaker<Source, Code>>  
  export type FailureOutcome<Source extends { [k: string]: RegisterEntry }, Code extends RegisterKeys<Source>> = Outcome.Failure<Code, Message<Source, Code>, Details<Source, Code>>
  
  export function from<Source extends { [k: string]: RegisterEntry }> (source: Source) {
    function getMessage<Code extends RegisterKeys<Source>> (code: Code): Message<Source, Code> {
      const message = source[code]!.message
      return message
    }

    function getDetailsMaker<Code extends RegisterKeys<Source>> (code: Code): DetailsMaker<Source, Code> {
      const maker = source[code]!.detailsMaker as DetailsMaker<Source, Code>
      return maker
    }

    function getDetails<Code extends RegisterKeys<Source>> (code: Code, ...params: DetailsMakerParams<Source, Code>): Details<Source, Code> {
      const maker = getDetailsMaker(code) as undefined | ((...p: any[]) => any)
      const details = maker?.(...params)
      return details
    }

    function getFailureOutcome<Code extends RegisterKeys<Source>> (code: Code, ...params: DetailsMakerParams<Source, Code>): FailureOutcome<Source, Code> {
      const message = getMessage(code)
      const details = getDetails(code, ...params)
      return Outcome.makeFailure(code, message, details)
    }

    class CustomError<Code extends RegisterKeys<Source>> extends Error {
      code: Code
      details: Details<Source, Code>
      constructor (code: Code, ...params: DetailsMakerParams<Source, Code>) {
        super(getMessage(code))
        const details = getDetails(code, ...params)
        this.code = code
        this.details = details
      }
    }

    function getError<Code extends RegisterKeys<Source>> (code: Code, ...params: DetailsMakerParams<Source, Code>): CustomError<Code> {
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
