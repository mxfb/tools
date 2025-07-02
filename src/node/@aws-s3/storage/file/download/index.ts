import { Readable } from 'node:stream'
import { S3 } from 'aws-sdk'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type DownloadOptions = {
  downloadSettings?: S3.Types.GetObjectRequest
}

/**
 * Downloads a file from a specified Amazon S3 bucket.
 *
 * This function downloads a file from the given bucket and path, returning the file content as a `Readable` stream.
 * The download process can be customized using optional `downloadSettings`.
 *
 * @param {S3} s3 - The AWS S3 client instance.
 * @param {string} bucketName - The name of the S3 bucket from which to download the file.
 * @param {string} sourcePath - The path of the file to be downloaded in the bucket.
 * @param {DownloadOptions} [options] - Optional configuration options for the download.
 * @param {S3.Types.GetObjectRequest} [options.downloadSettings] - Settings for the download process.
 * @returns {Promise<Outcome.Either<Readable, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(stream)` containing the downloaded file's content as a `Readable` stream.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the download fails.
 */
export async function download (
  s3: S3,
  bucketName: string,
  sourcePath: string,
  options?: DownloadOptions
): Promise<Outcome.Either<Readable, string>> {
  const { downloadSettings } = options ?? {}
  const params: S3.Types.GetObjectRequest = {
    ...downloadSettings,
    Bucket: bucketName,
    Key: sourcePath
  }
  try {
    const data = await s3.getObject(params).promise()
    const stream = data.Body as Readable
    return Outcome.makeSuccess(stream)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
