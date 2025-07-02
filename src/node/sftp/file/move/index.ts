import Client from 'ssh2-sftp-client'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'
import { Outcome } from '../../../../agnostic/misc/outcome'

export type MoveOptions = Record<string, never>   // ssh2‑sftp‑client.rename has no extra options

/**
 * Moves a file from one location to another on an SFTP server.
 *
 * The function performs `rename`, which atomically moves the file from `sourcePath`
 * to `targetPath` on the same server.
 *
 * @param {Client} sftp - The ssh2‑sftp‑client instance.
 * @param {string} sourcePath - The path of the source file.
 * @param {string} targetPath - The destination path.
 * @param {MoveOptions} [options] - Currently unused.
 * @returns {Promise<Outcome.Either<true, string>>}
 * - On success: `Outcome.makeSuccess(true)`.
 * - On failure: `Outcome.makeFailure(errStr)`.
 */
export async function move (
  sftp: Client,
  sourcePath: string,
  targetPath: string,
  options?: MoveOptions
): Promise<Outcome.Either<true, string>> {
  void options
  try {
    await sftp.rename(sourcePath, targetPath)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
