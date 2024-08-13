type AnyFunc = (...args: any[]) => any
type ParamsOfNullableFunc<F extends AnyFunc | undefined | null> = F extends AnyFunc ? Parameters<F> : []
type ReturnTypeOfNullableFunc<F extends AnyFunc | undefined | null> = F extends AnyFunc ? ReturnType<F> : undefined

export namespace Errors {
  export type Factory<Params extends any[] = any[], Details = any> = {
    message: string
    makeDetails?: (...params: Params) => Details
  }

  export type Index<Params extends any[] = any[], Details = any> = {
    [code: string]: Factory<Params, Details>
  }

  export type Data<RS extends Index, C extends keyof RS> = {
    code: C,
    message: RS[C]['message'],
    details: ReturnTypeOfNullableFunc<RS[C]['makeDetails']>
  }

  export class CustomError<Idx extends Index, Code extends keyof Idx> extends Error {
    code: Data<Idx, Code>['code']
    details: Data<Idx, Code>['details']
    constructor (data: Data<Idx, Code>) {
      const { code, message, details } = data
      super(message)
      this.code = code
      this.details = details
    }
  }

  export class Register<Idx extends Index> {
    index: Idx

    constructor (index: Idx) {
      this.index = index
    }

    getFactory<C extends keyof Idx> (code: C): Idx[C] {
      return this.index[code]
    }

    getData<C extends keyof Idx> (code: C, ...params: ParamsOfNullableFunc<Idx[C]['makeDetails']>): Data<Idx, C> {
      const core = this.getFactory(code)
      const { message, makeDetails } = core
      return {
        code,
        message: message,
        details: makeDetails?.(...params)
      }
    }

    getError<C extends keyof Idx> (code: C, ...params: ParamsOfNullableFunc<Idx[C]['makeDetails']>): CustomError<Idx, C> {
      return new CustomError(this.getData(code, ...params))
    }
  }
}

