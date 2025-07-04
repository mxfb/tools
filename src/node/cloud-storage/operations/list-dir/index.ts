import { Outcome } from '../../../../agnostic/misc/outcome'
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
import { list as ftpList } from '../../../ftps/directory/list'
import { list as sftpList } from '../../../sftp/directory/list'
import { ListOptions as S3ListOptions, list as s3List } from '../../../@aws-s3/storage/directory/list'
import { ListOptions as GcsListOptions, list as gcsList } from '../../../@google-cloud/storage/directory/list'

type Returned = Outcome.Either<string[], string>

export async function listDir (client: GCSBucket, path: string, options?: GcsListOptions): Promise<Returned>
export async function listDir (client: S3ClientWithBucket, path: string, options?: S3ListOptions): Promise<Returned>
export async function listDir (client: FtpClient, path: string): Promise<Returned>
export async function listDir (client: SftpClient, path: string): Promise<Returned>
export async function listDir (client: AnyClient, path: string, options?: GcsListOptions | S3ListOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsList(client, path, options as GcsListOptions)
  if (isS3ClientWithBucket(client)) return s3List(client.client, client.bucketName, path, options as S3ListOptions)
  if (isFtpClient(client)) return ftpList(client, path)
  if (isSftpClient(client)) return sftpList(client, path)
  return Outcome.makeFailure('Invalid client type')
}
