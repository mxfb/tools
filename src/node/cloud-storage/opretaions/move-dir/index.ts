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
import { moveDir as ftpMoveDir } from 'node/ftps/directory/move-dir'
import { moveDir as sftpMoveDir } from 'node/sftp/directory/move-dir'
import { MoveDirOptions as S3MoveDirOptions, moveDir as s3MoveDir } from 'node/@aws-s3/storage/directory/move-dir'
import { MoveDirOptions as GcsMoveDirOptions, moveDir as gcsMoveDir } from 'node/@google-cloud/storage/directory/move-dir'

type Returned = Outcome.Either<true, string>

export async function moveDir (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsMoveDirOptions): Promise<Returned>
export async function moveDir (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3MoveDirOptions): Promise<Returned>
export async function moveDir (client: FtpClient, sourcePath: string, targetPath: string): Promise<Returned>
export async function moveDir (client: SftpClient, sourcePath: string, targetPath: string): Promise<Returned>
export async function moveDir (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsMoveDirOptions | S3MoveDirOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsMoveDir(client, sourcePath, targetPath, options as GcsMoveDirOptions)
  if (isS3ClientWithBucket(client)) return s3MoveDir(client.client, client.bucketName, sourcePath, targetPath, options as S3MoveDirOptions)
  if (isFtpClient(client)) return ftpMoveDir(client, sourcePath, targetPath)
  if (isSftpClient(client)) return sftpMoveDir(client, sourcePath, targetPath)
  return Outcome.makeFailure('Invalid client type')
}
