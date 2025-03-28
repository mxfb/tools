import { Type } from '../endpoint'
import { isNonNullObject } from '~/agnostic/objects/is-object'

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

export function isGcsBucketCredentials (unknownObject: unknown): unknownObject is GcsBucketCredentials {
  if (!isNonNullObject(unknownObject)) return false
  if ('client_email' in unknownObject
    && typeof unknownObject.client_email === 'string'
    && 'private_key' in unknownObject
    && typeof unknownObject.private_key === 'string'
    && 'project_id' in unknownObject
    && typeof unknownObject.project_id === 'string') return true
  return false
}

export function isS3BucketCredentials (unknownObject: unknown): unknownObject is S3BucketCredentials {
  if (!isNonNullObject(unknownObject)) return false
  if ('accessKeyId' in unknownObject
    && typeof unknownObject.accessKeyId === 'string'
    && 'secretAccessKey' in unknownObject
    && typeof unknownObject.secretAccessKey === 'string') {
    if ('region' in unknownObject
      && typeof unknownObject.region === 'string') return true
    if (!('region' in unknownObject)) return true
    return false
  }
  return false
}

export function isFtpCredentials (unknownObject: unknown): unknownObject is FtpCredentials {
  if (!isNonNullObject(unknownObject)) return false
  if ('host' in unknownObject
    && typeof unknownObject.host === 'string'
    && 'port' in unknownObject
    && typeof unknownObject.port === 'number'
    && 'username' in unknownObject
    && typeof unknownObject.username === 'string'
    && 'password' in unknownObject
    && typeof unknownObject.password === 'string') return true
  return false
}

export function isFtpsCredentials (unknownObject: unknown): unknownObject is FtpsCredentials {
  if (!isNonNullObject(unknownObject)) return false
  if ('host' in unknownObject
    && typeof unknownObject.host === 'string'
    && 'port' in unknownObject
    && typeof unknownObject.port === 'number'
    && 'username' in unknownObject
    && typeof unknownObject.username === 'string'
    && 'password' in unknownObject
    && typeof unknownObject.password === 'string') return true
  return false
}

export function isSftpCredentials (unknownObject: unknown): unknownObject is SftpCredentials {
  if (!isNonNullObject(unknownObject)) return false
  if ('host' in unknownObject
    && typeof unknownObject.host === 'string'
    && 'port' in unknownObject
    && typeof unknownObject.port === 'number'
    && 'username' in unknownObject
    && typeof unknownObject.username === 'string') {
    const { password, privateKey, passphrase } = unknownObject as any
    if (typeof password !== 'string' && password !== undefined) return false
    if (typeof privateKey !== 'string' && privateKey !== undefined) return false
    if (typeof passphrase !== 'string' && passphrase !== undefined) return false
    return true
  }
  return false
}
