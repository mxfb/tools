import Client from 'ssh2-sftp-client'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'

export type ListOptions = Record<string, never>

/**
 * Lists all direct children files under a given directory on an SFTP server.
 *
 * This function returns only the immediate files (not recursive) under the specified directory.
 *
 * @param {Client} sftp - The ssh2-sftp-client instance used to interact with the SFTP server.
 * @param {string} directoryPath - The directory path to list files under.
 * @param {ListOptions} [options] - Optional configuration for the listing (currently unused).
 * @returns {Promise<Outcome.Either<string[], string>>} Returns either a success with an array of file paths, or a failure with an error message.
 */
export async function list (
  sftp: Client,
  directoryPath: string,
  options?: ListOptions
): Promise<Outcome.Either<string[], string>> {
  void options
  try {
    const list = await sftp.list(directoryPath)
    const files = list
      .filter(entry => entry.type === '-')
      .map(entry => (directoryPath.endsWith('/') ? directoryPath + entry.name : directoryPath + '/' + entry.name))
    return Outcome.makeSuccess(files)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
