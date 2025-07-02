import Client from 'ssh2-sftp-client'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'

export type MoveDirOptions = {
  /** If false and `targetDir` exists, the operation is aborted. Defaults to false. */
  overwrite?: boolean
}

/**
 * Renames (moves) a directory on an SFTP server using `rename`, which moves
 * the entire tree in one operation when supported by the server.
 * @param {Client} sftp - The SFTP client instance.
 * @param {string} sourceDir - The source directory path to move from.
 * @param {string} targetDir - The target directory path to move to.
 * @param {MoveDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the move was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the move fails.
 */
export async function moveDir (
  sftp: Client,
  sourceDir: string,
  targetDir: string,
  options?: MoveDirOptions
): Promise<Outcome.Either<true, string>> {
  const { overwrite = false } = options ?? {}

  try {
    if (!overwrite) {
      const exists = await sftp.exists(targetDir)
      if (exists) return Outcome.makeFailure(`Target ${targetDir} already exists.`)
    }

    await sftp.rename(sourceDir, targetDir)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
