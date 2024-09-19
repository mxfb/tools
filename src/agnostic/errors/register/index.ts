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
  export type ErrorData<Source extends { [k: string]: RegisterEntry }, Code extends RegisterKeys<Source>> = {
    code: Code
    message: Message<Source, Code>,
    details: Details<Source, Code>
  }
  
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

    function getErrorData<Code extends RegisterKeys<Source>> (
      code: Code,
      ...params: DetailsMakerParams<Source, Code>
    ): ErrorData<Source, Code> {
      const message = getMessage(code)
      const details = getDetails(code, ...params)
      return { code, message, details }
    }

    class RegisteredError<Code extends RegisterKeys<Source>> extends Error {
      code: Code
      details: Details<Source, Code>
      constructor (code: Code, ...params: DetailsMakerParams<Source, Code>) {
        const data = getErrorData(code, ...params)
        super(data.message)
        this.code = data.code
        this.details = data.details
      }
    }

    function getError<Code extends RegisterKeys<Source>> (code: Code, ...params: DetailsMakerParams<Source, Code>): RegisteredError<Code> {
      return new RegisteredError(code, ...params)
    }

    return {
      getMessage,
      getDetailsMaker,
      getDetails,
      getErrorData,
      getError,
      source
    }
  }
}
