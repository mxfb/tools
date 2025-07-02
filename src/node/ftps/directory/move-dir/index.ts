import { Client } from 'basic-ftp'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'

export type MoveDirOptions = {
  /** If false and `targetDir` exists, the operation is aborted. Defaults to false. */
  overwrite?: boolean
}

/**
 * Renames (moves) a directory on an FTP server.  
 * Most FTP servers allow `RNFR /path/old` + `RNTO /path/new` to move a tree
 * atomically. Falling back to manual copy/delete would be expensive, so this
 * util simply performs `rename`.
 * @param {Client} ftpClient - The FTP client instance.
 * @param {string} sourceDir - The source directory path to move from.
 * @param {string} targetDir - The target directory path to move to.
 * @param {MoveDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the move was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the move fails.
 */
export async function moveDir (
  ftpClient: Client,
  sourceDir: string,
  targetDir: string,
  options?: MoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const { overwrite = false } = options ?? {}

  try {
    if (!overwrite) {
      try {
        await ftpClient.size(targetDir)            // will throw 550 for dirs
        return Outcome.makeFailure(`Target ${targetDir} already exists.`)
      } catch { /* not found – ok */ }
    }

    await ftpClient.rename(sourceDir, targetDir)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
