import S3, { CopyObjectRequest, DeleteObjectRequest } from 'aws-sdk/clients/s3'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'
import { Outcome } from '../../../../../agnostic/misc/outcome'

export type MoveOptions = {
  copyOptions?: Omit<CopyObjectRequest, 'Bucket' | 'Key' | 'CopySource'>
  deleteOptions?: Omit<DeleteObjectRequest, 'Bucket' | 'Key'>
}

/**
 * Moves an object from one location to another within an S3 bucket.
 *
 * The function first copies the object at `sourcePath` to `targetPath`, then deletes the
 * original object on successful copy. Custom behaviour can be provided via `copyOptions`
 * and `deleteOptions`.
 *
 * @param {S3} client - The S3 client used to interact with the bucket.
 * @param {string} bucketName - The name of the S3 bucket containing the object.
 * @param {string} sourcePath - The key of the source object to move.
 * @param {string} targetPath - The key where the object will be moved to.
 * @param {MoveOptions} [options] - Optional configuration for the move operation.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success: `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function move (
  client: S3,
  bucketName: string,
  sourcePath: string,
  targetPath: string,
  options?: MoveOptions
): Promise<Outcome.Either<true, string>> {
  const { copyOptions, deleteOptions } = options ?? {}
  try {
    await client.copyObject({
      Bucket: bucketName,
      Key: targetPath,
      CopySource: `${bucketName}/${sourcePath}`,
      ...copyOptions
    }).promise()
    await client.deleteObject({
      Bucket: bucketName,
      Key: sourcePath,
      ...deleteOptions
    }).promise()
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
