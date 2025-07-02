import { Client } from 'basic-ftp'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'

/**
 * Recursively deletes a directory (and all contents) on an FTP server.
 * @param {Client} ftpClient - The FTP client instance.
 * @param {string} directoryPath - The path of the directory to delete.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)`.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message.
 */
export async function removeDir (
  ftpClient: Client,
  directoryPath: string
): Promise<Outcome.Either<true, string>> {
  async function recurse (dir: string): Promise<void> {
    const list = await ftpClient.list(dir)
    for (const entry of list) {
      const full = dir.endsWith('/') ? dir + entry.name : dir + '/' + entry.name
      if (entry.isDirectory) {
        await recurse(full)
      } else if (entry.isFile) {
        await ftpClient.remove(full)
      }
    }
    // After contents are gone, remove the directory itself
    await ftpClient.removeDir(dir)
  }

  try {
    await recurse(directoryPath)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
