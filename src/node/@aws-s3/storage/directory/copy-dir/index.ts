import S3 from 'aws-sdk/clients/s3'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type CopyDirOptions = {
  listObjectsOptions?: Omit<S3.ListObjectsV2Request, 'Bucket' | 'Prefix'>
  copyOptions?: Omit<S3.CopyObjectRequest,  'Bucket' | 'Key' | 'CopySource'>
}

/** Recursively copies every object under `sourceDir` to the same relative path
 *  beneath `targetDir` within a single S3 bucket.
 * @param {S3} client - The S3 client instance.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} sourceDir - The source directory path (prefix) to copy from.
 * @param {string} targetDir - The target directory path (prefix) to copy to.
 * @param {CopyDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the copy was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the copy fails.
 */
export async function copyDir (
  client: S3,
  bucketName: string,
  sourceDir: string,
  targetDir: string,
  options?: CopyDirOptions
): Promise<Outcome.Either<true, string>> {
  const { listObjectsOptions, copyOptions } = options ?? {}
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

      for (const obj of list.Contents ?? []) {
        if (!obj.Key) continue
        const rel  = obj.Key.substring(from.length)
        const dest = `${to}${rel}`

        await client.copyObject({
          Bucket: bucketName,
          Key: dest,
          CopySource: `${bucketName}/${obj.Key}`,
          ...copyOptions
        }).promise()
      }

      token = list.IsTruncated ? list.NextContinuationToken : undefined
    } while (token)

    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
