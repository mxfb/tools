type AnyFunc = (...args: any[]) => any
type ParamsOfNullableFunc<F extends AnyFunc | undefined | null> = F extends AnyFunc ? Parameters<F> : []
type ReturnTypeOfNullableFunc<F extends AnyFunc | undefined | null> = F extends AnyFunc ? ReturnType<F> : undefined

export namespace Errors {
  export type ErrFactory<Params extends any[] = any[], Details = any> = {
    message: string
    makeDetails?: (...params: Params) => Details
  }

  export type ErrData<RS extends RegisterSource, C extends keyof RS> = {
    code: C,
    message: RS[C]['message'],
    details: ReturnTypeOfNullableFunc<RS[C]['makeDetails']>
  }

  export type RegisterSource<P extends any[] = any[], D = any> = { [code: string]: ErrFactory<P, D> }

  export class CustomError<RS extends RegisterSource, C extends keyof RS> extends Error {
    code: ErrData<RS, C>['code']
    details: ErrData<RS, C>['details']
    constructor (data: ErrData<RS, C>) {
      const { code, message, details } = data
      super(message)
      this.code = code
      this.details = details
    }
  }

  export class Register<RS extends RegisterSource> {
    private _source: RS

    constructor (source: RS) {
      this._source = source
    }

    getFactory<C extends keyof RS> (code: C): RS[C] {
      return this._source[code]
    }

    getData<C extends keyof RS> (code: C, ...params: ParamsOfNullableFunc<RS[C]['makeDetails']>): ErrData<RS, C> {
      const core = this.getFactory(code)
      const { message, makeDetails } = core
      return {
        code,
        message: message,
        details: makeDetails?.(...params)
      }
    }

    getError<C extends keyof RS> (code: C, ...params: ParamsOfNullableFunc<RS[C]['makeDetails']>): CustomError<RS, C> {
      return new CustomError(this.getData(code, ...params))
    }
  }
}

