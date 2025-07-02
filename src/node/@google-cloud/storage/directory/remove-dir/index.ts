import { Bucket, DeleteFileOptions as GCSDeleteFileOptions } from '@google-cloud/storage'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type RemoveDirOptions = {
  /** Extra parameters forwarded to `bucket.deleteFiles`. */
  deleteOptions?: GCSDeleteFileOptions & { force?: boolean }
}

/**
 * Recursively deletes all objects under a directory prefix in a GCS bucket
 * (including the directory placeholder itself, if present).
 * @param {Bucket} bucket - The GCS bucket instance.
 * @param {string} directoryPath - The path of the directory to delete.
 * @param {RemoveDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the directory was successfully deleted.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the deletion fails.
 */
export async function removeDir (
  bucket: Bucket,
  directoryPath: string,
  options?: RemoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const { deleteOptions } = options ?? {}
  const prefix = directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`

  try {
    // `deleteFiles` removes all matching objects in a single call.
    await bucket.deleteFiles({ prefix, ...deleteOptions })
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
