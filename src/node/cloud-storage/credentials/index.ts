import { Type } from '../endpoint'

export type GcsBucketCredentials = {
  client_email: string
  private_key: string
  project_id: string
}

export type S3BucketCredentials = {
  accessKeyId: string
  secretAccessKey: string
  region?: string
}

export type FtpCredentials = {
  host: string
  port: number
  username: string
  password: string
}

export type FtpsCredentials = {
  host: string
  port: number
  username: string
  password: string
  implicit: boolean
}

export type SftpCredentials = {
  host: string
  port: number
  username: string
  password?: string // Optional for password-based auth
  privateKey?: string // Optional for key-based auth
  passphrase?: string // Optional, decrypts `privateKey`
}

export type Credentials<T extends Type> = T extends Type.GCS
  ? GcsBucketCredentials : T extends Type.S3
  ? S3BucketCredentials : T extends Type.FTP
  ? FtpCredentials : T extends Type.FTPS
  ? FtpsCredentials : T extends Type.SFTP
  ? SftpCredentials : never
