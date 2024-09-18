export namespace Register {
  export type RegisterEntry = {
    message: string
    detailsMaker: (...params: any[]) => any
  }
  
  export function from<Input extends { [k: string]: RegisterEntry }> (register: Input) {
    type RegisterKeys = keyof Input
    type Message<Code extends RegisterKeys> = Input[Code]['message']
    type DetailsMaker<Code extends RegisterKeys> = Input[Code]['detailsMaker']
    type DetailsMakerParams<Code extends RegisterKeys> = Parameters<DetailsMaker<Code>>
    type Details<Code extends RegisterKeys> = ReturnType<DetailsMaker<Code>>

    function getMessage<Code extends RegisterKeys> (code: Code): Message<Code> {
      const message = register[code]!.message
      return message
    }

    function getDetailsMaker<Code extends RegisterKeys> (code: Code): DetailsMaker<Code> {
      const maker = register[code]!.detailsMaker
      return maker
    }

    function getDetails<Code extends RegisterKeys> (code: Code, ...params: DetailsMakerParams<Code>): Details<Code> {
      const maker = getDetailsMaker(code) as any
      const details = maker(...params)
      return details
    }

    return {
      getMessage,
      getDetailsMaker,
      getDetails,
      register
    }
  }
}
