import { Readable } from 'node:stream'
import { Bucket } from '@google-cloud/storage'
import { S3 } from 'aws-sdk'
import { Client as FtpClient } from 'basic-ftp'
import SftpClient from 'ssh2-sftp-client'
import { Outcome } from '~/agnostic/misc/outcome'
import { upload as uploadGcs } from '../../@google-cloud/storage/file/upload'
import { download as downloadGcs } from '../../@google-cloud/storage/file/download'
import { upload as uploadS3 } from '../../@aws-s3/storage/file/upload'
import { download as downloadS3 } from '../../@aws-s3/storage/file/download'
import { upload as uploadFtp } from '../../ftps/file/upload'
import { download as downloadFtp } from '../../ftps/file/download'
import { upload as uploadSftp } from '../../sftp/file/upload'
import { download as downloadSftp } from '../../sftp/file/download'
import { Client, makeClient } from '../client'
import { Credentials } from '../credentials'
import { Type, Endpoint, s3IdentifierData } from '../endpoint'

export async function upload<T extends Type> (
  fileReadable: Readable,
  targetPath: string,
  endpointType: T,
  endpointIdentifier: Endpoint<T>['identifier'],
  credentials: Credentials<T>,
  client?: Client<T>
): Promise<Outcome.Either<true, string>> {
  if (client === undefined) {
    const clientCreationOutcome = await makeClient(endpointType, endpointIdentifier, credentials)
    if (!clientCreationOutcome.success) return Outcome.makeFailure(clientCreationOutcome.error)
    client = clientCreationOutcome.payload
  }
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

export async function download<T extends Type> (
  targetPath: string,
  endpointType: T,
  endpointIdentifier: Endpoint<T>['identifier'],
  credentials: Credentials<T>,
  client?: Client<T>
) {
  if (client === undefined) {
    const clientCreationOutcome = await makeClient(endpointType, endpointIdentifier, credentials)
    if (!clientCreationOutcome.success) return Outcome.makeFailure(clientCreationOutcome.error)
    client = clientCreationOutcome.payload
  }
  if (endpointType === Type.GCS && client instanceof Bucket) return await downloadGcs(targetPath, client as Bucket)
  if (endpointType === Type.S3 && client instanceof S3) {
    const { bucketName } = s3IdentifierData(endpointIdentifier)
    if (bucketName === null) return Outcome.makeFailure('Invalid S3 bucket name')
    return await downloadS3(targetPath, bucketName, client as S3)
  }
  if (endpointType === Type.FTP && client instanceof FtpClient) return await downloadFtp(targetPath, client as FtpClient)
  if (endpointType === Type.FTPS && client instanceof FtpClient) return await downloadFtp(targetPath, client as FtpClient)
  if (endpointType === Type.SFTP && client instanceof SftpClient) return await downloadSftp(targetPath, client as SftpClient)
  return Outcome.makeFailure('Invalid endpoint or client type')
}
