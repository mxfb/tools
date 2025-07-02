export enum Type {
  GCS = 'gcs-bucket',
  S3 = 's3-bucket',
  FTP = 'ftp',
  FTPS = 'ftps',
  SFTP = 'sftp'
}

export type Endpoint<T extends Type = Type> = {
  type: T
  identifier: string
  // gs-bucket identifier scheme: <bucket-name>/<optional-path>
  // s3-bucket identifier scheme: <bucket-name>/<optional-path>
  // ftp-host identifier scheme: <hostname>:<port>/<path>
  // ftps-host identifier scheme: <hostname>:<port>/<path>
  // sftp-host identifier scheme: <hostname>:<port>/<path>
  // [WIP] later: ipfs-host identifier scheme: <ipfs host>/ipfs/QmXjYz
}

export function gcsIdentifierData (identifier: string): {
  bucketName: string | null,
  path: string
} {
  identifier = identifier.trim().replace(/^\//, '')
  const [bucketName, ...pathChunks] = identifier.split('/')
  return {
    bucketName: bucketName ?? null,
    path: `/${pathChunks.join('/')}`
  }
}

export function s3IdentifierData (identifier: string): {
  bucketName: string | null,
  path: string
} {
  identifier = identifier.trim().replace(/^\//, '')
  const [bucketName, ...pathChunks] = identifier.split('/')
  return {
    bucketName: bucketName ?? null,
    path: `/${pathChunks.join('/')}`
  }
}

export function ftpIdentifierData (identifier: string): {
  host: string | null,
  port: string | null,
  path: string
} {
  identifier = identifier.trim().replace(/^\//, '')
  const [hostAndPort, ...pathChunks] = identifier.split('/')
  const [host, port] = hostAndPort?.split(':') ?? []
  return {
    host: host ?? null,
    port: port ?? null,
    path: `/${pathChunks.join('/')}`
  }
}
