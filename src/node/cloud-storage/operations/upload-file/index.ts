import { Readable } from 'node:stream'
import { Outcome } from 'agnostic/misc/outcome'
import {
  AnyClient,
  isFtpClient,
  isGcsBucket,
  isS3ClientWithBucket,
  isSftpClient,
  S3ClientWithBucket
} from '../../clients'
import { Bucket as GCSBucket } from '@google-cloud/storage'
import { Client as FtpClient } from 'basic-ftp'
import SftpClient from 'ssh2-sftp-client'
import { UploadOptions as FtpUploadOptions, upload as ftpUpload } from '../../../ftps/file/upload'
import { UploadOptions as SftpUploadOptions, upload as sftpUpload } from '../../../sftp/file/upload'
import { UploadOptions as S3UploadOptions, upload as s3Upload } from '../../../@aws-s3/storage/file/upload'
import { UploadOptions as GcsUploadOptions, upload as gcsUpload } from '../../../@google-cloud/storage/file/upload'

type Returned = Outcome.Either<true, string>

export async function uploadFile (fileStream: Readable, path: string, client: GCSBucket, options?: GcsUploadOptions): Promise<Returned>
export async function uploadFile (fileStream: Readable, path: string, client: S3ClientWithBucket, options?: S3UploadOptions): Promise<Returned>
export async function uploadFile (fileStream: Readable, path: string, client: FtpClient, options?: FtpUploadOptions): Promise<Returned>
export async function uploadFile (fileStream: Readable, path: string, client: SftpClient, options?: SftpUploadOptions): Promise<Returned>
export async function uploadFile (fileStream: Readable, path: string, client: AnyClient, options?: GcsUploadOptions | S3UploadOptions | FtpUploadOptions | SftpUploadOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsUpload(client, path, fileStream, options as GcsUploadOptions)
  if (isS3ClientWithBucket(client)) return s3Upload(client.client, client.bucketName, path, fileStream, options as S3UploadOptions)
  if (isFtpClient(client)) return ftpUpload(client, path, fileStream, options as FtpUploadOptions)
  if (isSftpClient(client)) return sftpUpload(client, path, fileStream, options as SftpUploadOptions)
  return Outcome.makeFailure('Invalid client type')
}
