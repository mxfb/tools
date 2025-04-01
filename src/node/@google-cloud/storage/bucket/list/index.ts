import { Bucket, GetFileOptions } from '@google-cloud/storage'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type ListOptions = {
  getFileOptions?: GetFileOptions
}

/**
 * Lists the children files (immediate files) of a given bucket.
 * 
 * This function can be configured with options to customize the listing, such as including prefixes or limiting the number of results.
 * If no options are provided, it lists all files in the bucket.
 * 
 * @param {Bucket} bucket - The GCS bucket to list files from.
 * @param {ListOptions} [options] - Optional configuration for the file listing.
 * @param {GetFileOptions} [options.getFileOptions] - Additional options to control the file listing, such as delimiters or filters.
 * @returns {Promise<Outcome.Either<string[], string>>} - Returns either a success with an array of file names or a failure with an error message.
 */
export async function list (
  bucket: Bucket,
  options?: ListOptions
): Promise<Outcome.Either<string[], string>> {
  const { getFileOptions } = options ?? {}
  try {
    const [files] = await bucket.getFiles(getFileOptions)
    const fileNames = files.map(file => file.name)
    return Outcome.makeSuccess(fileNames)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
