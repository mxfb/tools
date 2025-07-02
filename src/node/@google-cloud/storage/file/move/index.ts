import {
  Bucket,
  FileOptions,
  CopyOptions,
  DeleteFileOptions as GCSDeleteFileOptions
} from '@google-cloud/storage'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'
import { Outcome } from '../../../../../agnostic/misc/outcome'

export type MoveOptions = {
  fileOptions?: FileOptions
  copyOptions?: CopyOptions
  deleteOptions?: GCSDeleteFileOptions
}

/**
 * Moves a file from one location to another within a Google Cloud Storage bucket.
 *
 * This function first copies the file located at `sourcePath` to `targetPath`, then deletes the source file 
 * after the copy is successful. The process can be customized using optional `fileOptions`, `copyOptions`, and `deleteOptions`.
 *
 * @param {Bucket} bucket - The Google Cloud Storage bucket object containing the file to be moved.
 * @param {string} sourcePath - The path of the source file to be moved.
 * @param {string} targetPath - The target path where the file will be moved to.
 * @param {MoveOptions} [options] - Optional configuration options for the file move operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(true)` indicating the file was successfully moved.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the move operation fails.
 *
 * @throws {Error} Throws an error if the move operation fails (e.g., source file not found, insufficient permissions, etc.).
 */
export async function move (
  bucket: Bucket,
  sourcePath: string,
  targetPath: string,
  options?: MoveOptions
): Promise<Outcome.Either<true, string>> {
  const { fileOptions, copyOptions, deleteOptions } = options ?? {}
  try {
    const file = bucket.file(sourcePath, fileOptions)
    await file.copy(targetPath, copyOptions)
    await file.delete(deleteOptions)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
