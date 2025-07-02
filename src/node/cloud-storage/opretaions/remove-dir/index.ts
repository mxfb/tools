import { Outcome } from 'agnostic/misc/outcome'
import {
  AnyClient,
  isFtpClient,
  isGcsBucket,
  isS3ClientWithBucket,
  isSftpClient,
  S3ClientWithBucket
} from 'node/cloud-storage/clients'
import { Bucket as GCSBucket } from '@google-cloud/storage'
import { Client as FtpClient } from 'basic-ftp'
import SftpClient from 'ssh2-sftp-client'
import { removeDir as ftpRemoveDir } from 'node/ftps/directory/remove-dir'
import { removeDir as sftpRemoveDir } from 'node/sftp/directory/remove-dir'
import { RemoveDirOptions as S3RemoveDirOptions, removeDir as s3RemoveDir } from 'node/@aws-s3/storage/directory/remove-dir'
import { RemoveDirOptions as GcsRemoveDirOptions, removeDir as gcsRemoveDir } from 'node/@google-cloud/storage/directory/remove-dir'

type Returned = Outcome.Either<true, string>

export async function removeDir (client: GCSBucket, sourcePath: string, options?: GcsRemoveDirOptions): Promise<Returned>
export async function removeDir (client: S3ClientWithBucket, sourcePath: string, options?: S3RemoveDirOptions): Promise<Returned>
export async function removeDir (client: FtpClient, sourcePath: string): Promise<Returned>
export async function removeDir (client: SftpClient, sourcePath: string): Promise<Returned>
export async function removeDir (client: AnyClient, sourcePath: string, options?: GcsRemoveDirOptions | S3RemoveDirOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsRemoveDir(client, sourcePath, options as GcsRemoveDirOptions)
  if (isS3ClientWithBucket(client)) return s3RemoveDir(client.client, client.bucketName, sourcePath, options as S3RemoveDirOptions)
  if (isFtpClient(client)) return ftpRemoveDir(client, sourcePath)
  if (isSftpClient(client)) return sftpRemoveDir(client, sourcePath)
  return Outcome.makeFailure('Invalid client type')
}
