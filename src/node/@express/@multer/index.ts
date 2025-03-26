import { Request, Response, RequestHandler } from 'express'
import multer, { Options, Field } from 'multer'
import { Outcome } from '../../../agnostic/misc/outcome'

export type WithMulterSharedOptions = {
  limits?: Options['limits']
  fileFilter?: Options['fileFilter']
}

export type WithMulterModeOptions = { mode: 'none' | 'any' }
  | { mode: 'single', fieldName: string }
  | { mode: 'array', fieldName: string, maxCount?: number }
  | { mode: 'fields', fields: Field[] }

export type WithMulterOptions = WithMulterSharedOptions & WithMulterModeOptions

export async function useMulterMiddleware (req: Request, res: Response, options: WithMulterOptions): Promise<Outcome.Either<true, unknown>> {
  const { limits, fileFilter } = options
  const uploader = multer({ storage: multer.memoryStorage(), limits, fileFilter })
  let middleware: RequestHandler
  if (options.mode === 'none') { middleware = uploader.none() }
  else if (options.mode === 'single') { middleware = uploader.single(options.fieldName) }
  else if (options.mode === 'array') { middleware = uploader.array(options.fieldName, options.maxCount) }
  else if (options.mode === 'fields') { middleware = uploader.fields(options.fields) }
  else { middleware = uploader.any() }
  return await new Promise<Outcome.Either<true, unknown>>(resolve => middleware(req, res, (err: unknown) => {
    resolve(err !== undefined
      ? Outcome.makeFailure(err)
      : Outcome.makeSuccess(true)
    )
  }))
}
