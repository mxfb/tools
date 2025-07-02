import S3 from 'aws-sdk/clients/s3'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type MoveDirOptions = {
  listObjectsOptions?: Omit<S3.ListObjectsV2Request, 'Bucket' | 'Prefix'>
  copyOptions?:       Omit<S3.CopyObjectRequest,  'Bucket' | 'Key' | 'CopySource'>
  deleteOptions?:     Omit<S3.DeleteObjectRequest,'Bucket' | 'Key'>
}

/**
 * Recursively moves every object under `sourceDir` to the corresponding path
 * under `targetDir` within the same S3 bucket.
 * @param {S3} client - The S3 client instance.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} sourceDir - The source directory path (prefix) to move from.
 * @param {string} targetDir - The target directory path (prefix) to move to.
 * @param {MoveDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the move was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the move fails.
 */
export async function moveDir (
  client: S3,
  bucketName: string,
  sourceDir: string,
  targetDir: string,
  options?: MoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const { listObjectsOptions, copyOptions, deleteOptions } = options ?? {}
  const from = sourceDir.endsWith('/') ? sourceDir : `${sourceDir}/`
  const to   = targetDir.endsWith('/') ? targetDir   : `${targetDir}/`

  try {
    let token: string | undefined
    do {
      const list = await client.listObjectsV2({
        Bucket: bucketName,
        Prefix: from,
        ContinuationToken: token,
        ...listObjectsOptions
      }).promise()

      const keys = (list.Contents ?? []).map(o => o.Key!).filter(Boolean)

      for (const key of keys) {
        const rel  = key.substring(from.length)
        const dest = `${to}${rel}`

        await client.copyObject({
          Bucket: bucketName,
          Key: dest,
          CopySource: `${bucketName}/${key}`,
          ...copyOptions
        }).promise()

        await client.deleteObject({
          Bucket: bucketName,
          Key: key,
          ...deleteOptions
        }).promise()
      }

      token = list.IsTruncated ? list.NextContinuationToken : undefined
    } while (token)

    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
