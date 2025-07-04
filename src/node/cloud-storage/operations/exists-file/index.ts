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
import { exists as ftpExists } from '../../../ftps/file/exists'
import { exists as sftpExists } from '../../../sftp/file/exists'
import { ExistsOptions as S3ExistsOptions, exists as s3Exists } from '../../../@aws-s3/storage/file/exists'
import { ExistsOptions as GcsExistsOptions, exists as gcsExists } from '../../../@google-cloud/storage/file/exists'

type Returned = Outcome.Either<boolean, string>

export async function existsFile (client: GCSBucket, path: string, options?: GcsExistsOptions): Promise<Returned>
export async function existsFile (client: S3ClientWithBucket, path: string, options?: S3ExistsOptions): Promise<Returned>
export async function existsFile (client: FtpClient, path: string): Promise<Returned>
export async function existsFile (client: SftpClient, path: string): Promise<Returned>
export async function existsFile (client: AnyClient, path: string, options?: GcsExistsOptions | S3ExistsOptions): Promise<Returned> {
  if (isGcsBucket(client)) return gcsExists(client, path, options as GcsExistsOptions)
  if (isS3ClientWithBucket(client)) return s3Exists(client.client, client.bucketName, path, options as S3ExistsOptions)
  if (isFtpClient(client)) return ftpExists(client, path)
  if (isSftpClient(client)) return sftpExists(client, path)
  return Outcome.makeFailure('Invalid client type')
}
