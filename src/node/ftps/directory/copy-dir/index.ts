import { Client } from 'basic-ftp'
import { PassThrough } from 'node:stream'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { unknownToString } from '../../../../agnostic/errors/unknown-to-string'

export type CopyDirOptions = {
  /** If false and a destination file already exists, copying aborts. Defaults to false. */
  overwrite?: boolean
}

/** Recursively copies every file under `sourceDir` to the same relative path
 *  beneath `targetDir` on an FTP server, using streams to avoid buffering.
 * @param {Client} ftpClient - The FTP client instance.
 * @param {string} sourceDir - The source directory path to copy from.
 * @param {string} targetDir - The target directory path to copy to.
 * @param {CopyDirOptions} [options] - Optional parameters for the operation.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`:
 * - On success: `Outcome.makeSuccess(true)` indicating the copy was successful.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if the copy fails.
 */
export async function copyDir (
  ftpClient: Client,
  sourceDir: string,
  targetDir: string,
  options?: CopyDirOptions
): Promise<Outcome.Either<true, string>> {
  const { overwrite = false } = options ?? {}

  async function recurse (dir: string): Promise<void> {
    const list = await ftpClient.list(dir)
    for (const entry of list) {
      const src = dir.endsWith('/') ? dir + entry.name : dir + '/' + entry.name
      const rel = src.substring(sourceDir.length + (sourceDir.endsWith('/') ? 0 : 1))
      const dst = targetDir.endsWith('/') ? targetDir + rel : `${targetDir}/${rel}`

      if (entry.isDirectory) {
        await ftpClient.ensureDir(dst)
        await recurse(src)
      } else if (entry.isFile) {
        if (!overwrite) {
          try {
            await ftpClient.size(dst)
            throw new Error(`File already exists at ${dst}.`)
          } catch { /* 550 not found – okay */ }
        }
        const pass = new PassThrough()
        const upload = ftpClient.uploadFrom(pass, dst)
        await ftpClient.downloadTo(pass, src)
        await upload
      }
    }
  }

  try {
    await ftpClient.ensureDir(targetDir)
    await recurse(sourceDir)
    return Outcome.makeSuccess(true)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
