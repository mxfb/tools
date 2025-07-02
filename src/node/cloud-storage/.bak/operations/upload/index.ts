import { Readable } from 'node:stream'
import { Bucket } from '@google-cloud/storage'
import { S3 } from 'aws-sdk'
import { Client as FtpClient } from 'basic-ftp'
import SftpClient from 'ssh2-sftp-client'
import { Outcome } from '../../../../agnostic/misc/outcome'
import { upload as uploadGcs } from '../../../@google-cloud/storage/file/upload'
import { upload as uploadS3 } from '../../../@aws-s3/storage/file/upload'
import { upload as uploadFtp } from '../../../ftps/file/upload'
import { upload as uploadSftp } from '../../../sftp/file/upload'
import { Client } from '../../client'
import { Type, Endpoint, s3IdentifierData } from '../../endpoint'

export async function upload<T extends Type> (
  fileReadable: Readable,
  targetPath: string,
  endpointType: T,
  endpointIdentifier: Endpoint<T>['identifier'],
  client: Client<T>
): Promise<Outcome.Either<true, string>> {
  if (endpointType === Type.GCS && client instanceof Bucket) return await uploadGcs(fileReadable, targetPath, client as Bucket)
  if (endpointType === Type.S3 && client instanceof S3) {
    const { bucketName } = s3IdentifierData(endpointIdentifier)
    if (bucketName === null) return Outcome.makeFailure('Invalid S3 bucket name')
    return await uploadS3(fileReadable, targetPath, bucketName, client as S3)
  }
  if (endpointType === Type.FTP && client instanceof FtpClient) return await uploadFtp(fileReadable, targetPath, client as FtpClient)
  if (endpointType === Type.FTPS && client instanceof FtpClient) return await uploadFtp(fileReadable, targetPath, client as FtpClient)
  if (endpointType === Type.SFTP && client instanceof SftpClient) return await uploadSftp(fileReadable, targetPath, client as SftpClient)
  return Outcome.makeFailure('Invalid endpoint or client type')
}
