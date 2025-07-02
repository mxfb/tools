import {
  Bucket,
  FileOptions,
  CopyOptions as GCSCopyOptions,
  DeleteFileOptions as GCSDeleteOptions
} from '@google-cloud/storage'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../../agnostic/errors/unknown-to-string'

export type MoveDirOptions = {
  fileOptions?: FileOptions
  copyOptions?: GCSCopyOptions
  deleteOptions?: GCSDeleteOptions
}

/**
 * Recursively moves every object under `sourceDir` to the corresponding path
 * under `targetDir` within the same bucket.
 *
 * Example: moving `a/b/` to `x/y/` copies
 * `a/b/file.txt` → `x/y/file.txt` and then deletes the original.
 * @param {Bucket} bucket - The GCS bucket instance.
 * @param {string} sourceDir - The source directory path (prefix) to move from.
 * @param {string} targetDir - The target directory path (prefix) to move to.
 * @param {MoveDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the move was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the move fails.
 */
export async function moveDir (
  bucket: Bucket,
  sourceDir: string,
  targetDir: string,
  options?: MoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const { fileOptions, copyOptions, deleteOptions } = options ?? {}
  const from = sourceDir.endsWith('/') ? sourceDir : `${sourceDir}/`
  const to   = targetDir.endsWith('/')   ? targetDir   : `${targetDir}/`

  try {
    const [files] = await bucket.getFiles({ prefix: from })
    for (const f of files) {
      const rel  = f.name.substring(from.length)
      const dest = `${to}${rel}`
      const srcFile = bucket.file(f.name, fileOptions)
      await srcFile.copy(dest, copyOptions)
      await srcFile.delete(deleteOptions)
    }
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
