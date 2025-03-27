import { Buffer } from 'node:buffer'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { Readable, Writable } from 'node:stream'
import { unknownToString } from '~/agnostic/errors/unknown-to-string'
import { Outcome } from '~/agnostic/misc/outcome'

export type EncryptDecryptOptions = {
  ivLength?: number
  // [WIP] maybe allow to pass a cipher here for performance optim?
}

/**
 * Encrypts a `Uint8Array` using the specified algorithm and encryption key.
 *
 * @param {Uint8Array} fileArray - The input data to encrypt.
 * @param {string} encryptionKey - The encryption key to use.
 * @param {string} [algorithm='aes-256-gcm'] - The encryption algorithm to use. Defaults to 'aes-256-gcm'.
 * @param {EncryptDecryptOptions} [options] - Optional options.
 * @param {number} [options.ivLength=16] - The length of the initialization vector (IV). Defaults to 16 bytes.
 * 
 * @returns {Outcome.Either<Uint8Array, string>} The result of the encryption. Success returns the encrypted data as a `Uint8Array` (with IV prepended), or failure returns an error message.
 */
export function encryptUint8Array (
  fileArray: Uint8Array,
  encryptionKey: string,
  algorithm: string = 'aes-256-gcm',
  options?: EncryptDecryptOptions
): Outcome.Either<Uint8Array, string> {
  try {
    const { ivLength = 16 } = options ?? {}
    const iv = randomBytes(ivLength)
    const cipher = createCipheriv(algorithm, encryptionKey, iv)
    let encrypted = cipher.update(fileArray)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    return Outcome.makeSuccess(new Uint8Array(Buffer.concat([iv, encrypted])))
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}

/**
 * Decrypts an encrypted `Uint8Array` using the specified algorithm and encryption key.
 *
 * @param {Uint8Array} encryptedFile - The encrypted data to decrypt.
 * @param {string} encryptionKey - The encryption key to use.
 * @param {string} [algorithm='aes-256-gcm'] - The encryption algorithm to use. Defaults to 'aes-256-gcm'.
 * @param {EncryptDecryptOptions} [options] - Optional options.
 * @param {number} [options.ivLength=16] - The length of the initialization vector (IV). Defaults to 16 bytes.
 * 
 * @returns {Outcome.Either<Uint8Array, string>} The result of the decryption. Success returns the decrypted data as a `Uint8Array`, or failure returns an error message.
 */
export function decryptUint8Array (
  encryptedFile: Uint8Array,
  encryptionKey: string,
  algorithm: string = 'aes-256-gcm',
  options?: EncryptDecryptOptions
): Outcome.Either<Uint8Array, string> {
  const { ivLength = 16 } = options ?? {}
  try {
    const iv = encryptedFile.subarray(0, ivLength)
    const encryptedData = encryptedFile.subarray(ivLength)
    const decipher = createDecipheriv(algorithm, encryptionKey, iv)
    let decrypted = decipher.update(encryptedData)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return Outcome.makeSuccess(new Uint8Array(decrypted))
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}

/**
 * Encrypts a `Uint8Array` using streams and returns a `Readable` stream containing the encrypted data.
 * The `Readable` stream will emit encrypted data in chunks.
 *
 * @param {Uint8Array} fileArray - The input data to be encrypted.
 * @param {string} encryptionKey - The encryption key to use for encryption.
 * @param {string} [algorithm='aes-256-gcm'] - The encryption algorithm to use (default: 'aes-256-gcm').
 * @param {EncryptDecryptOptions} [options] - Optional parameters for encryption, such as `ivLength`.
 * @param {number} [options.ivLength=16] - The length of the initialization vector (IV) to use (default: 16).
 * 
 * @returns {Outcome.Either<Readable, string>} - An `Outcome` containing either the `Readable` stream on success, 
 * or an error message on failure.
 */
export function encryptUint8ArrayWithStream (
  fileArray: Uint8Array,
  encryptionKey: string,
  algorithm: string = 'aes-256-gcm',
  options?: EncryptDecryptOptions
): Outcome.Either<Readable, string> {
  try {
    const { ivLength = 16 } = options ?? {}
    const iv = randomBytes(ivLength)
    const readable = new Readable({
      read() {
        this.push(fileArray)
        this.push(null)
      }
    })
    const encryptedChunks: Buffer[] = []
    const writable = new Writable({
      write: function (chunk, _encoding, callback) {
        encryptedChunks.push(chunk)
        callback()
      }
    })
    const cipher = createCipheriv(algorithm, encryptionKey, iv)
    readable.pipe(cipher).pipe(writable)
    return Outcome.makeSuccess(readable)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}

/**
 * Decrypts an encrypted `Uint8Array` using streams and returns a `Readable` stream containing the decrypted data.
 * The `Readable` stream will emit decrypted data in chunks.
 *
 * @param {Uint8Array} encryptedFile - The encrypted data to be decrypted.
 * @param {string} encryptionKey - The encryption key to use for decryption.
 * @param {string} [algorithm='aes-256-gcm'] - The decryption algorithm to use (default: 'aes-256-gcm').
 * @param {EncryptDecryptOptions} [options] - Optional parameters for decryption, such as `ivLength`.
 * @param {number} [options.ivLength=16] - The length of the initialization vector (IV) to use (default: 16).
 * 
 * @returns {Outcome.Either<Readable, string>} - An `Outcome` containing either the `Readable` stream on success, 
 * or an error message on failure.
 */
export function decryptUint8ArrayWithStream (
  encryptedFile: Uint8Array,
  encryptionKey: string,
  algorithm: string = 'aes-256-gcm',
  options?: EncryptDecryptOptions
): Outcome.Either<Readable, string> {
  const { ivLength = 16 } = options ?? {}
  try {
    const iv = encryptedFile.subarray(0, ivLength)
    const encryptedData = encryptedFile.subarray(ivLength)
    const readable = new Readable({
      read() {
        this.push(encryptedData)
        this.push(null)
      }
    })
    const decryptedChunks: Buffer[] = []
    const writable = new Writable({
      write: function (chunk, _encoding, callback) {
        decryptedChunks.push(chunk)
        callback()
      }
    })
    const decipher = createDecipheriv(algorithm, encryptionKey, iv)
    readable.pipe(decipher).pipe(writable)
    return Outcome.makeSuccess(readable)
  } catch (err) {
    const errStr = unknownToString(err)
    return Outcome.makeFailure(errStr)
  }
}
