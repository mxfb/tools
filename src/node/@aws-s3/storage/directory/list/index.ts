import S3 from 'aws-sdk/clients/s3'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type ListOptions = {
  listObjectsOptions?: Omit<S3.ListObjectsV2Request, 'Bucket' | 'Prefix' | 'Delimiter'>
}

/**
 * Lists all direct children file keys under a given directory prefix in an S3 bucket.
 *
 * This function returns only the immediate files (not recursive) under the specified directory prefix.
 *
 * @param {S3} client - The S3 client used to list objects.
 * @param {string} bucketName - The name of the S3 bucket to list files from.
 * @param {string} directoryPath - The directory prefix to list files under.
 * @param {ListOptions} [options] - Optional configuration for the listing.
 * @param {S3.ListObjectsV2Request} [options.listObjectsOptions] - Additional options for the listObjectsV2 request.
 * @returns {Promise<Outcome.Either<string[], string>>} Returns either a success with an array of file keys, or a failure with an error message.
 */
export async function list (
  client: S3,
  bucketName: string,
  directoryPath: string,
  options?: ListOptions
): Promise<Outcome.Either<string[], string>> {
  const { listObjectsOptions } = options ?? {}
  const prefix = directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`
  try {
    const response = await client.listObjectsV2({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: '/',
      ...listObjectsOptions
    }).promise()

    const keys = (response.Contents ?? []).map(obj => obj.Key!).filter(key => !!key)
    return Outcome.makeSuccess(keys)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
