import { Storage, Bucket } from '@google-cloud/storage'
import { S3 } from 'aws-sdk'
import { Client as FtpClient } from 'basic-ftp'
import SftpClient from 'ssh2-sftp-client'
import { Outcome } from '../../../agnostic/misc/outcome'
import { unknownToString } from '../../../agnostic/errors/unknown-to-string'
import { GcsBucketCredentials, S3BucketCredentials, FtpCredentials, FtpsCredentials, SftpCredentials, Credentials } from '../credentials'
import {
  Type,
  Endpoint,
  gcsIdentifierData,
  ftpIdentifierData
} from '../endpoint'

export type Client<T extends Type> = T extends Type.GCS
  ? Bucket : T extends Type.S3
  ? S3 : T extends Type.FTP
  ? FtpClient : T extends Type.FTPS
  ? FtpClient : T extends Type.SFTP
  ? SftpClient : never

export async function makeClient<T extends Type> (
  endpointType: T,
  endpointIdentifier: Endpoint<T>['identifier'],
  credentials: Credentials<T>): Promise<Outcome.Either<Client<T>, string>> {
  if (endpointType === Type.GCS) {
    return makeGcsClient({ type: endpointType, identifier: endpointIdentifier }, credentials as GcsBucketCredentials) as Outcome.Either<Client<T>, string>
  } else if (endpointType === Type.S3) {
    return makeS3Client(credentials as S3BucketCredentials) as Outcome.Either<Client<T>, string>
  } else if (endpointType === Type.FTP) {
    return await makeFtpClient({ type: endpointType, identifier: endpointIdentifier }, credentials as FtpCredentials) as Outcome.Either<Client<T>, string> 
  } else if (endpointType === Type.FTPS) {
    return await makeFtpsClient({ type: endpointType, identifier: endpointIdentifier }, credentials as FtpsCredentials) as Outcome.Either<Client<T>, string>
  } else if (endpointType === Type.SFTP) {
    return await makeSftpClient({ type: endpointType, identifier: endpointIdentifier }, credentials as SftpCredentials) as Outcome.Either<Client<T>, string>
  } else {
    return Outcome.makeFailure(`Invalid endpoint type: ${endpointType}`)
  }
}

export function makeGcsClient (endpoint: Endpoint<Type.GCS>, credentials: GcsBucketCredentials): Outcome.Either<Bucket, string> {
  const storage = new Storage({ credentials: credentials as GcsBucketCredentials })
  const { bucketName } = gcsIdentifierData(endpoint.identifier)
  if (bucketName === null) return Outcome.makeFailure('Invalid GCS bucket name')
  const bucket = storage.bucket(bucketName)
  return Outcome.makeSuccess(bucket)
}

export function makeS3Client (credentials: S3BucketCredentials): Outcome.Either<S3, string> {
  const s3 = new S3({ credentials: credentials as S3BucketCredentials })
  return Outcome.makeSuccess(s3)
}

export async function makeFtpClient(endpoint: Endpoint<Type.FTP>, credentials: FtpCredentials): Promise<Outcome.Either<FtpClient, string>> {
  const { host, port, path } = ftpIdentifierData(endpoint.identifier)
  if (host === null) return Outcome.makeFailure('Invalid host information')
  if (port === null) return Outcome.makeFailure('Invalid port information')
  const client = new FtpClient()
  try {
    await client.access({
      host,
      port: parseInt(port),
      user: credentials.username,
      password: credentials.password
    })
    await client.cd(path)
    return Outcome.makeSuccess(client)  
  } catch (err) {
    unknownToString(err)
    return Outcome.makeFailure(unknownToString(err))
  }
}

export async function makeFtpsClient(endpoint: Endpoint<Type.FTPS>, credentials: FtpsCredentials): Promise<Outcome.Either<FtpClient, string>> {
  const { host, port, path } = ftpIdentifierData(endpoint.identifier)
  if (host === null) return Outcome.makeFailure('Invalid host information')
  if (port === null) return Outcome.makeFailure('Invalid port information')
  const client = new FtpClient()
  try {
    await client.access({
      host,
      port: parseInt(port),
      user: credentials.username,
      password: credentials.password,
      secure: true,
      secureOptions: credentials.implicit
        ? { rejectUnauthorized: false } // Implicit mode requires direct TLS
        : undefined // Explicit mode uses STARTTLS
    })
    await client.cd(path)
    return Outcome.makeSuccess(client)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}

export async function makeSftpClient(endpoint: Endpoint<Type.SFTP>, credentials: SftpCredentials): Promise<Outcome.Either<SftpClient, string>> {
  const { host, port, path } = ftpIdentifierData(endpoint.identifier)
  if (host === null) return Outcome.makeFailure('Invalid host information')
  if (port === null) return Outcome.makeFailure('Invalid port information')
  const sftp = new SftpClient()
  try {
    await sftp.connect({
      host,
      port: parseInt(port),
      username: credentials.username,
      password: credentials.password,
      privateKey: credentials.privateKey,
      passphrase: credentials.passphrase
    })
    try {
      const stats = await sftp.stat(path)
      if (!stats.isDirectory) return Outcome.makeFailure(`Target path exists but is not a directory: ${path}`)
    } catch (err) {
      return Outcome.makeFailure(`Target directory does not exist: ${path}`)
    }
    return Outcome.makeSuccess(sftp)
  } catch (err) {
    return Outcome.makeFailure(unknownToString(err))
  }
}
