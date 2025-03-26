import { Bucket, FileOptions, DownloadOptions as GCSFileDownloadOptions } from '@google-cloud/storage'
import { unknownToString } from '~/agnostic/errors/unknown-to-string'
import { Outcome } from '~/agnostic/misc/outcome'

export type DownloadOptions = {
  fileOptions?: FileOptions
  downloadOptions?: GCSFileDownloadOptions
}

/**
 * Downloads a file from a specified Google Cloud Storage bucket.
 *
 * This function downloads a file from the given bucket and path, returning the file content as a `Buffer`.
 * The download process can be customized using optional `fileOptions` and `downloadOptions`.
 *
 * @param {string} sourcePath - The path of the file to be downloaded in the bucket.
 * @param {Bucket} bucket - The Google Cloud Storage bucket object from which to download the file.
 * @param {DownloadOptions} [options] - Optional configuration options for the download.
 * @returns {Promise<Outcome.Either<Buffer, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(buffer)` containing the downloaded file's content as a `Buffer`.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the download fails.
 */
export async function download (
  sourcePath: string,
  bucket: Bucket,
  options?: DownloadOptions 
): Promise<Outcome.Either<Buffer, string>> {
  const { fileOptions, downloadOptions } = options ?? {}
  try {
    const file = bucket.file(sourcePath, fileOptions)
    const downloaded = await file.download(downloadOptions)
    return Outcome.makeSuccess(downloaded[0])
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
