import { Client } from 'basic-ftp'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'
import { Outcome } from '../../../../agnostic/misc/outcome'

/**
 * Checks if a file exists on a specified FTP server.
 *
 * This function verifies whether a file at the given `sourcePath` exists on the FTP server.
 *
 * @param {Client} ftpClient - The basic-ftp client instance used to interact with the FTP server.
 * @param {string} sourcePath - The path of the file to check on the FTP server.
 * @returns {Promise<Outcome.Either<boolean, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(true) if the file exists, or Outcome.makeSuccess(false) if it does not.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the check fails.
 */
export async function exists (
  ftpClient: Client,
  sourcePath: string
): Promise<Outcome.Either<boolean, string>> {
  try {
    await ftpClient.size(sourcePath)
    return Outcome.makeSuccess(true)
  } catch (err) {
    const code = (err as any)?.code
    if (code === 550) {
      // 550 indicates the file was not found
      return Outcome.makeSuccess(false)
    }
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
