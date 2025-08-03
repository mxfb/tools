import { Bucket as GCSBucket } from '@google-cloud/storage'
import { S3Client } from '@aws-sdk/client-s3'
import { Client as FtpClient } from 'basic-ftp'
import SftpClient from 'ssh2-sftp-client'

export type S3ClientWithBucket = {
  bucketName: string
  client: S3Client
}

export type AnyClient = GCSBucket | S3ClientWithBucket | FtpClient | SftpClient

export const isGcsBucket = (client: AnyClient): client is GCSBucket => client instanceof GCSBucket
export const isS3ClientWithBucket = (client: AnyClient): client is S3ClientWithBucket =>
  ('bucketName' in client)
  && typeof client.bucketName === 'string'
  && ('client' in client)
  && client.client instanceof S3Client
export const isFtpClient = (client: AnyClient): client is FtpClient => client instanceof FtpClient
export const isSftpClient = (client: AnyClient): client is SftpClient => client instanceof SftpClient
