import { Readable } from 'node:stream'
import { Bucket, FileOptions, SaveOptions } from '@google-cloud/storage'
import { unknownToString } from '~/agnostic/errors/unknown-to-string'
import { Outcome } from '~/agnostic/misc/outcome'

export type UploadOptions = {
  fileOptions?: FileOptions
  saveOptions?: SaveOptions & { overwrite?: boolean }
}

/**
 * Uploads a file stream to a specified Google Cloud Storage bucket.
 *
 * This function uploads the provided file stream to the specified bucket at the given target path.
 * The upload can be customized using optional `fileOptions` and `saveOptions`.
 * If the `overwrite` option is false and a file already exists at the target path, the upload is aborted.
 *
 * @param {Readable} fileStream - The file content to be uploaded.
 * @param {string} targetPath - The target path where the file will be saved in the bucket.
 * @param {Bucket} bucket - The Google Cloud Storage bucket object.
 * @param {UploadOptions} [options] - Optional options to configure the upload process.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(true) indicating the upload was successful.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the upload fails.
 */
export async function upload (
  fileStream: Readable,
  targetPath: string,
  bucket: Bucket,
  options?: UploadOptions
): Promise<Outcome.Either<true, string>> {
  const { fileOptions, saveOptions } = options ?? {}
  const { overwrite = false } = saveOptions ?? {}
  const file = bucket.file(targetPath, fileOptions)
  if (!overwrite) {
    try {
      const [exists] = await file.exists()
      if (exists) {
        return Outcome.makeFailure(`File already exists at ${targetPath}.`)
      }
    } catch (err) {
      const errStr = unknownToString(err)
      return Outcome.makeFailure(errStr)
    }
  }
  try {
    await new Promise((resolve, reject) => {
      const writeStream = file.createWriteStream(saveOptions)
      fileStream.pipe(writeStream)
      fileStream.on('error', reject)
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
