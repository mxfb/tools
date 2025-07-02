import S3, { HeadObjectRequest } from 'aws-sdk/clients/s3'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type ExistsOptions = {
  /**
   * Additional options to pass to `headObject`.
   * `Bucket` and `Key` will be overridden by this function.
   */
  headObjectOptions?: Omit<HeadObjectRequest, 'Bucket' | 'Key'>
}

/**
 * Checks if a file exists in the specified S3 bucket.
 * 
 * This function verifies whether an object at the given `sourcePath` exists in the bucket. It can be configured with options to customize the behavior of the check.
 * 
 * @param {S3} client - The S3 client used to perform the check.
 * @param {string} bucketName - The name of the S3 bucket to inspect.
 * @param {string} sourcePath - The key of the object to check within the bucket.
 * @param {ExistsOptions} [options] - Optional configuration for the object existence check.
 * @param {HeadObjectRequest} [options.headObjectOptions] - Additional options for the `headObject` call, such as conditional headers.
 * @returns {Promise<Outcome.Either<boolean, string>>} - Returns either a success with `true` or `false` indicating whether the object exists, or a failure with an error message.
 */
export async function exists (
  client: S3,
  bucketName: string,
  sourcePath: string,
  options?: ExistsOptions
): Promise<Outcome.Either<boolean, string>> {
  const { headObjectOptions } = options ?? {}
  try {
    const params: HeadObjectRequest = {
      Bucket: bucketName,
      Key: sourcePath,
      ...(headObjectOptions ?? {})
    }
    await client.headObject(params).promise()
    return Outcome.makeSuccess(true)
  } catch (err) {
    const code = (err as any)?.code
    const status = (err as any)?.statusCode
    if (code === 'NotFound' || code === 'NoSuchKey' || status === 404) {
      return Outcome.makeSuccess(false)
    }
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
