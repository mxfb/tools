import { S3 } from 'aws-sdk'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type RemoveOptions = {
  ignoreMissing?: boolean /* defaults to false */
}

/**
 * Removes a file from a specified Amazon S3 bucket.
 *
 * This function deletes the object located at the specified target path in the given bucket.
 * If the `ignoreMissing` option is true, a missing object is treated as a success instead of an error.
 *
 * @param {S3} s3 - The AWS S3 client instance.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} targetPath - The key of the object to remove from the bucket.
 * @param {RemoveOptions} [options] - Optional settings for configuring the removal process.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(true) indicating the removal was successful.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the removal fails.
 */
export async function remove (
  s3: S3,
  bucketName: string,
  targetPath: string,
  options?: RemoveOptions
): Promise<Outcome.Either<true, string>> {
  const { ignoreMissing = false } = options ?? {}
  try {
    // Check if the object exists first (to respect ignoreMissing)
    try {
      await s3.headObject({ Bucket: bucketName, Key: targetPath }).promise()
    } catch (err: any) {
      const code = (err as any)?.code ?? (err as any)?.statusCode
      if ((code === 'NotFound' || code === 404)) {
        if (ignoreMissing) return Outcome.makeSuccess(true)
        return Outcome.makeFailure(`File not found at ${targetPath}.`)
      }
      const errStr = unknownToString(err)
      return Outcome.makeFailure(errStr)
    }

    // Remove the object from S3
    await s3.deleteObject({ Bucket: bucketName, Key: targetPath }).promise()
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
