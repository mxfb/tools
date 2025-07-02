import S3, { CopyObjectRequest } from 'aws-sdk/clients/s3'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type CopyOptions = {
  /**
   * Additional parameters for the underlying `copyObject` call.
   * `Bucket`, `Key`, and `CopySource` are set by this utility.
   */
  copyOptions?: Omit<CopyObjectRequest, 'Bucket' | 'Key' | 'CopySource'>
}

/**
 * Copies an object from one key to another within the same S3 bucket.
 *
 * @param {S3} client            - The S3 client instance.
 * @param {string} bucketName    - The name of the S3 bucket.
 * @param {string} sourcePath    - The key of the source object.
 * @param {string} targetPath    - The key where the object will be copied.
 * @param {CopyOptions} [options] - Optional copy configuration.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success:  `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function copy (
  client: S3,
  bucketName: string,
  sourcePath: string,
  targetPath: string,
  options?: CopyOptions
): Promise<Outcome.Either<true, string>> {
  const { copyOptions } = options ?? {}
  try {
    await client.copyObject({
      Bucket: bucketName,
      Key: targetPath,
      CopySource: `${bucketName}/${sourcePath}`,
      ...copyOptions
    }).promise()
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
