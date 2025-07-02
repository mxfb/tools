import Client from 'ssh2-sftp-client'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'

/**
 * Recursively deletes a directory (and all contents) on an SFTP server.
 * @param {Client} sftp - The SFTP client instance.
 * @param {string} directoryPath - The path of the directory to delete.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)`.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message.
 */
export async function removeDir (
  sftp: Client,
  directoryPath: string,
): Promise<Outcome.Either<true, string>> {
  async function recurse (dir: string): Promise<void> {
    const list = await sftp.list(dir)
    for (const entry of list) {
      const full = dir.endsWith('/') ? dir + entry.name : dir + '/' + entry.name
      if (entry.type === 'd') {
        await recurse(full)
      } else if (entry.type === '-') {
        await sftp.delete(full)
      }
    }
    await sftp.rmdir(dir)
  }

  try {
    await recurse(directoryPath)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
