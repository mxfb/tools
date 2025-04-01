import { Bucket, FileOptions, CopyOptions as GCSFileCopyOptions } from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'
import { Outcome } from '../../../../../agnostic/misc/outcome'

export type CopyOptions = {
  fileOptions?: FileOptions
  copyOptions?: GCSFileCopyOptions
}

/**
 * Copies a file from one location to another within a Google Cloud Storage bucket.
 *
 * This function copies the file located at `sourcePath` to `targetPath` in the same or a different Google Cloud Storage bucket. 
 * It can be customized using optional `fileOptions` and `copyOptions` to control the copying behavior.
 *
 * @param {string} sourcePath - The path of the source file to be copied.
 * @param {string} targetPath - The target path where the file will be copied to.
 * @param {Bucket} bucket - The Google Cloud Storage bucket object containing the file to be copied.
 * @param {CopyOptions} [options] - Optional configuration options for the file copy operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(true)` indicating the file was successfully copied.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the copy operation fails.
 */
export async function copy (
  sourcePath: string,
  targetPath: string,
  bucket: Bucket,
  options?: CopyOptions
): Promise<Outcome.Either<true, string>> {
  const { fileOptions, copyOptions } = options ?? {}
  try {
    const file = bucket.file(sourcePath, fileOptions)
    await file.copy(targetPath, copyOptions)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
