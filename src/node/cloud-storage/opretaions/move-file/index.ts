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
import { move as ftpMove } from 'node/ftps/file/move'
import { move as sftpMove } from 'node/sftp/file/move'
import { MoveOptions as S3MoveOptions, move as s3Move } from 'node/@aws-s3/storage/file/move'
import { MoveOptions as GcsMoveOptions, move as gcsMove } from 'node/@google-cloud/storage/file/move'

type Returned = Outcome.Either<true, string>

export async function moveFile (client: GCSBucket, sourcePath: string, targetPath: string, options?: GcsMoveOptions): Promise<Returned>
export async function moveFile (client: S3ClientWithBucket, sourcePath: string, targetPath: string, options?: S3MoveOptions): Promise<Returned>
export async function moveFile (client: FtpClient, sourcePath: string, targetPath: string): Promise<Returned>
export async function moveFile (client: SftpClient, sourcePath: string, targetPath: string): Promise<Returned>
export async function moveFile (client: AnyClient, sourcePath: string, targetPath: string, options?: GcsMoveOptions | S3MoveOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsMove(client, sourcePath, targetPath, options as GcsMoveOptions)
  if (isS3ClientWithBucket(client)) return s3Move(client.client, client.bucketName, sourcePath, targetPath, options as S3MoveOptions)
  if (isFtpClient(client)) return ftpMove(client, sourcePath, targetPath)
  if (isSftpClient(client)) return sftpMove(client, sourcePath, targetPath)
  return Outcome.makeFailure('Invalid client type')
}
