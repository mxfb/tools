import S3 from 'aws-sdk/clients/s3'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type RemoveDirOptions = {
  listObjectsOptions?: Omit<S3.ListObjectsV2Request, 'Bucket' | 'Prefix'>
  deleteObjectsOptions?: Omit<S3.DeleteObjectsRequest, 'Bucket' | 'Delete'>
}

/**
 * Recursively deletes all objects under a directory prefix in an S3 bucket.
 * Handles pagination and the 1 000‑key limit of `deleteObjects`.
 * @param {S3} client - The S3 client instance.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} directoryPath - The path of the directory to delete.
 * @param {RemoveDirOptions} [options] - Optional parameters for listing and deleting objects.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the directory was successfully deleted.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the deletion fails.
 */
export async function removeDir (
  client: S3,
  bucketName: string,
  directoryPath: string,
  options?: RemoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const { listObjectsOptions, deleteObjectsOptions } = options ?? {}
  const prefix = directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`

  try {
    let ContinuationToken: string | undefined
    do {
      const listResp = await client.listObjectsV2({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken,
        ...listObjectsOptions
      }).promise()

      const keys = (listResp.Contents ?? []).map(o => o.Key!).filter(Boolean)
      if (keys.length) {
        // Delete in batches of ≤1 000
        for (let i = 0; i < keys.length; i += 1000) {
          const chunk = keys.slice(i, i + 1000)
          await client.deleteObjects({
            Bucket: bucketName,
            Delete: { Objects: chunk.map(Key => ({ Key })) },
            ...deleteObjectsOptions
          }).promise()
        }
      }
      ContinuationToken = listResp.IsTruncated ? listResp.NextContinuationToken : undefined
    } while (ContinuationToken)

    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
