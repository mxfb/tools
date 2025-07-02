import Client from 'ssh2-sftp-client'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'
import { Outcome } from '../../../../agnostic/misc/outcome'

/**
 * Checks if a file exists on a specified SFTP server.
 *
 * This function verifies whether a file at the given `sourcePath` exists on the SFTP server.
 *
 * @param {Client} sftp - The ssh2-sftp-client instance used to interact with the SFTP server.
 * @param {string} sourcePath - The path of the file to check on the SFTP server.
 * @returns {Promise<Outcome.Either<boolean, string>>} A promise that resolves to an Outcome.Either.
 * - On success: Outcome.makeSuccess(true) if the file exists, or Outcome.makeSuccess(false) if it does not.
 * - On failure: Outcome.makeFailure(errStr) with an error message if the check fails.
 */
export async function exists (
  sftp: Client,
  sourcePath: string
): Promise<Outcome.Either<boolean, string>> {
  try {
    const exists = await sftp.exists(sourcePath)
    // sftp.exists returns false, or string indicating type ('d', '-', 'l')
    return Outcome.makeSuccess(Boolean(exists))
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
