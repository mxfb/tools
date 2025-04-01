import { Bucket } from '@google-cloud/storage'
import { Outcome } from '../../../../../agnostic/misc/outcome'
import { download, DownloadOptions } from '../download'
import { erase, EraseOptions } from '../erase'
import { upload, UploadOptions } from '../upload'

export type RevokeSignedUrlsOptions = {
  downloadOptions?: DownloadOptions
  eraseOptions?: EraseOptions
  uploadOptions?: UploadOptions
}

/**
 * Revokes the signed URLs for a file in Google Cloud Storage by downloading the file,
 * deleting it, and re-uploading it to effectively invalidate any previously generated signed URLs.
 *
 * This function first attempts to download the file from the bucket, then erases the file,
 * and finally re-uploads the file to the same path. The re-upload effectively revokes any signed URLs that 
 * were generated for the file, as they are tied to the file's existence and content.
 *
 * @param {string} sourcePath - The path of the file for which the signed URLs are to be revoked.
 * @param {Bucket} bucket - The Google Cloud Storage bucket containing the file.
 * @param {RevokeSignedUrlsOptions} [options] - Optional configuration options for the file operations.
 * @returns {Promise<Outcome.Either<true, string>>} A promise that resolves to an `Outcome.Either`.
 * - On success: `Outcome.makeSuccess(true)` if the file has been successfully re-uploaded after deletion.
 * - On failure: `Outcome.makeFailure(errStr)` with an error message if any of the steps (download, erase, or upload) fail.
 */
export async function revokeSignedUrls (
  sourcePath: string,
  bucket: Bucket,
  options?: RevokeSignedUrlsOptions
): Promise<Outcome.Either<true, string>> {
  const { downloadOptions, eraseOptions, uploadOptions } = options ?? {} 
  const downloadAttempt = await download(sourcePath, bucket, downloadOptions)
  if (!downloadAttempt.success) return downloadAttempt
  const deletionAttempt = await erase(sourcePath, bucket, eraseOptions)
  if (!deletionAttempt.success) return deletionAttempt
  const downloaded = downloadAttempt.payload
  const reuploadAttempt = await upload(downloaded, sourcePath, bucket, uploadOptions)
  if (!reuploadAttempt.success) return reuploadAttempt
  return Outcome.makeSuccess(true)
}
