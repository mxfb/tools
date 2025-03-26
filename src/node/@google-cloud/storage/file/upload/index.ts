import { Bucket, FileOptions, SaveOptions } from '@google-cloud/storage'
import { unknownToString } from '~/agnostic/errors/unknown-to-string'
import { Outcome } from '~/agnostic/misc/outcome'

export type UploadOptions = {
  fileOptions?: FileOptions
  saveOptions?: SaveOptions
}

/**
 * Uploads a file buffer to a specified Google Cloud Storage bucket.
 *
 * This function uploads the provided file buffer to the specified bucket at the given destination path.
 * The upload can be customized using optional `fileOptions` and `saveOptions`.
 *
 * @param {Buffer} filebuffer - The file content to be uploaded.
 * @param {string} destinationPath - The destination path where the file will be saved in the bucket.
 * @param {Bucket} bucket - The Google Cloud Storage bucket object.
 * @param {UploadOptions} [options] - Optional options to configure the upload process.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(true)` indicating the upload was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the upload fails.
 */
export async function upload (
  filebuffer: Buffer,
  destinationPath: string,
  bucket: Bucket,
  options?: UploadOptions
): Promise<Outcome.Either<true, string>> {
  const { fileOptions, saveOptions } = options ?? {}
  try {
    const file = bucket.file(destinationPath, fileOptions)
    await file.save(filebuffer, saveOptions)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
