import Client, { TransferOptions } from 'ssh2-sftp-client'
import { PassThrough } from 'node:stream'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'

export type CopyDirOptions = TransferOptions & {
  /** If false and a destination file already exists, copying aborts. Defaults to false. */
  overwrite?: boolean
}

/** Recursively copies every file under `sourceDir` to the same relative path
 * beneath `targetDir` on an SFTP server, streaming data to minimise memory usage.
 * @param {Client} sftp - The SFTP client instance.
 * @param {string} sourceDir - The source directory path to copy from.
 * @param {string} targetDir - The target directory path to copy to.
 * @param {CopyDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the copy was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the copy fails.
 */
export async function copyDir (
  sftp: Client,
  sourceDir: string,
  targetDir: string,
  options?: CopyDirOptions
): Promise<Outcome.Either<true, string>> {
  const { overwrite = false, ...transferOptions } = options ?? {}

  async function recurse (dir: string): Promise<void> {
    const list = await sftp.list(dir)
    for (const entry of list) {
      const src = dir.endsWith('/') ? dir + entry.name : dir + '/' + entry.name
      const rel = src.substring(sourceDir.length + (sourceDir.endsWith('/') ? 0 : 1))
      const dst = targetDir.endsWith('/') ? targetDir + rel : `${targetDir}/${rel}`

      if (entry.type === 'd') {
        await sftp.mkdir(dst, true)
        await recurse(src)
      } else if (entry.type === '-') {
        if (!overwrite) {
          const exists = await sftp.exists(dst)
          if (exists) throw new Error(`File already exists at ${dst}.`)
        }
        const pass = new PassThrough()
        const upload = sftp.put(pass, dst, transferOptions)
        await sftp.get(src, pass, transferOptions)
        await upload
      }
    }
  }

  try {
    await sftp.mkdir(targetDir, true)
    await recurse(sourceDir)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
