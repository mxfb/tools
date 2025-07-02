import { Client } from 'basic-ftp'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'
import { Outcome } from '../../../../agnostic/misc/outcome'

export type MoveOptions = Record<string, never>   // no extra options for basic‑ftp

/**
 * Moves a file from one location to another on an FTP server.
 *
 * The function issues a simple rename command which has the effect of moving the
 * file. Both source and target paths must reside on the same FTP server.
 *
 * @param {Client} ftpClient - The basic‑ftp client instance.
 * @param {string} sourcePath - The path of the source file.
 * @param {string} targetPath - The destination path.
 * @param {MoveOptions} [options] - Currently unused.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success: `Outcome.makeSuccess(true)`.
 * - On failure:  `Outcome.makeFailure(errStr)`.
 */
export async function move (
  ftpClient: Client,
  sourcePath: string,
  targetPath: string,
  options?: MoveOptions
): Promise<Outcome.Either<true, string>> {
  void options
  try {
    await ftpClient.rename(sourcePath, targetPath)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
