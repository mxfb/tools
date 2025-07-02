import { Readable } from 'node:stream'
import { S3 } from 'aws-sdk'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type UploadOptions = {
  fileMetadata?: S3.Types.PutObjectRequest
  uploadSettings?: S3.ManagedUpload.ManagedUploadOptions
  overwrite?: boolean
}

/**
 * Uploads a file stream to a specified Amazon S3 bucket.
 *
 * This function uploads the provided file stream to the specified bucket at the given target path.
 * The upload can be customized using optional `fileMetadata` and `uploadSettings`.
 * If the `overwrite` option is false and a file already exists at the target path, the upload is aborted.
 *
 * @param {S3} s3 - The AWS S3 client instance.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} targetPath - The target path where the file will be saved in the bucket.
 * @param {Readable} fileStream - The file content to be uploaded.
 * @param {UploadOptions} [options] - Optional options to configure the upload process.
 * @param {S3.Types.PutObjectRequest} [options.fileMetadata] - Additional metadata for the file being uploaded.
 * @param {S3.ManagedUpload.ManagedUploadOptions} [options.uploadSettings] - Settings for the managed upload process.
 * @param {boolean} [options.overwrite] - If false and a file exists at the target path, the upload is aborted.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(true) indicating the upload was successful.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the upload fails.
 */
export async function upload (
  s3: S3,
  bucketName: string,
  targetPath: string,
  fileStream: Readable,
  options?: UploadOptions
): Promise<Outcome.Either<true, string>> {
  const {
    uploadSettings,
    fileMetadata,
    overwrite = false
  } = options ?? {}
  if (!overwrite) {
    try {
      const fileLookup = await s3.headObject({ Bucket: bucketName, Key: targetPath }).promise()
      if (fileLookup.Metadata !== undefined) return Outcome.makeFailure(`File already exists at ${targetPath}.`)
    } catch (err: any) {
      const errStr = unknownToString(err)
      return Outcome.makeFailure(errStr)
    }
  }
  const params: S3.Types.PutObjectRequest = {
    ...fileMetadata,
    Bucket: bucketName,
    Key: targetPath,
    Body: fileStream
  }
  try {
    await s3.upload(params, uploadSettings).promise()
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
