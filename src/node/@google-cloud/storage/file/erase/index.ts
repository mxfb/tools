import { Bucket, FileOptions, DeleteFileOptions as GCSDeleteFileOptions } from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'
import { Outcome } from '../../../../../agnostic/misc/outcome'

export type EraseOptions = {
  fileOptions?: FileOptions
  deleteOptions?: GCSDeleteFileOptions
}

/**
 * Erases a file from a specified Google Cloud Storage bucket.
 *
 * This function erases the file located at `sourcePath` in the given bucket. 
 * It can be customized using optional `fileOptions` and `eraseOptions` to modify how the file is erased.
 *
 * @param {string} sourcePath - The path of the file to be erased in the bucket.
 * @param {Bucket} bucket - The Google Cloud Storage bucket object from which to erase the file.
 * @param {EraseOptions} [options] - Optional configuration options for the file deletion.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(true)` indicating the file was successfully erased.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the erase operation fails.
 */
export async function erase (
  sourcePath: string,
  bucket: Bucket,
  options?: EraseOptions
): Promise<Outcome.Either<true, string>> {
  const { fileOptions, deleteOptions } = options ?? {}
  try {
    const file = bucket.file(sourcePath, fileOptions)
    await file.delete(deleteOptions)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
