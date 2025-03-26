import { Readable } from 'node:stream'
import { Outcome } from '~/agnostic/misc/outcome'
import {
  EncryptDecryptOptions,
  encryptUint8Array,
  encryptUint8ArrayWithStream,
  decryptUint8Array,
  decryptUint8ArrayWithStream
} from '../uint8-array'

/**
 * Encrypts a `Buffer` by converting it to a `Uint8Array`, performing encryption, and then returning the result as a `Buffer`.
 *
 * @param {Buffer} inputBuffer - The input data to encrypt.
 * @param {string} encryptionKey - The encryption key to use.
 * @param {string} [algorithm='aes-256-gcm'] - The encryption algorithm to use. Defaults to 'aes-256-gcm'.
 * @param {EncryptDecryptOptions} [options] - Optional options.
 * @param {number} [options.ivLength=16] - The length of the initialization vector (IV). Defaults to 16 bytes.
 * 
 * @returns {Outcome.Either<Buffer, string>} The result of the encryption. Success returns the encrypted data as a `Buffer` (with IV prepended), or failure returns an error message.
 */
export function encryptBuffer (
  inputBuffer: Buffer,
  encryptionKey: string,
  algorithm: string = 'aes-256-gcm',
  options?: EncryptDecryptOptions
): Outcome.Either<Buffer, string> {
  const fileArray = new Uint8Array(inputBuffer)
  const encryptionOutcome = encryptUint8Array(fileArray, encryptionKey, algorithm, options)
  if (!encryptionOutcome.success) return encryptionOutcome
  return Outcome.makeSuccess(Buffer.from(encryptionOutcome.payload))
}

/**
 * Encrypts a `Buffer` using streams and returns a `Readable` stream containing the encrypted data.
 * The `Readable` stream will emit encrypted data in chunks.
 *
 * @param {Buffer} inputBuffer - The input data to be encrypted.
 * @param {string} encryptionKey - The encryption key to use for encryption.
 * @param {string} [algorithm='aes-256-gcm'] - The encryption algorithm to use (default: 'aes-256-gcm').
 * @param {EncryptDecryptOptions} [options] - Optional parameters for encryption, such as `ivLength`.
 * @param {number} [options.ivLength=16] - The length of the initialization vector (IV) to use (default: 16).
 * 
 * @returns {Outcome.Either<Readable, string>} - An `Outcome` containing either the `Readable` stream on success, 
 * or an error message on failure.
 */
export function encryptBufferWithStream (
  inputBuffer: Buffer,
  encryptionKey: string,
  algorithm: string = 'aes-256-gcm',
  options?: EncryptDecryptOptions
): Outcome.Either<Readable, string> {
  const fileArray = new Uint8Array(inputBuffer)
  return encryptUint8ArrayWithStream(fileArray, encryptionKey, algorithm, options)
}

/**
 * Decrypts an encrypted `Buffer` by converting it to a `Uint8Array`, performing decryption, and then returning the result as a `Buffer`.
 *
 * @param {Buffer} encryptedBuffer - The encrypted data to decrypt.
 * @param {string} encryptionKey - The encryption key to use.
 * @param {string} [algorithm='aes-256-gcm'] - The encryption algorithm to use. Defaults to 'aes-256-gcm'.
 * @param {EncryptDecryptOptions} [options] - Optional options.
 * @param {number} [options.ivLength=16] - The length of the initialization vector (IV). Defaults to 16 bytes.
 * 
 * @returns {Outcome.Either<Buffer, string>} The result of the decryption. Success returns the decrypted data as a `Buffer`, or failure returns an error message.
 */
export function decryptBuffer (
  encryptedBuffer: Buffer,
  encryptionKey: string,
  algorithm: string = 'aes-256-gcm',
  options?: EncryptDecryptOptions
): Outcome.Either<Buffer, string> {
  const encryptedArray = new Uint8Array(encryptedBuffer)
  const decryptionOutcome = decryptUint8Array(encryptedArray, encryptionKey, algorithm, options)
  if (!decryptionOutcome.success) return decryptionOutcome
  return Outcome.makeSuccess(Buffer.from(decryptionOutcome.payload))
}

/**
 * Decrypts an encrypted `Buffer` using streams and returns a `Readable` stream containing the decrypted data.
 * The `Readable` stream will emit decrypted data in chunks.
 *
 * @param {Buffer} encryptedBuffer - The encrypted data to be decrypted. The first `ivLength` bytes are treated as the initialization vector (IV).
 * @param {string} encryptionKey - The encryption key to use for decryption.
 * @param {string} [algorithm='aes-256-gcm'] - The decryption algorithm to use (default: 'aes-256-gcm').
 * @param {EncryptDecryptOptions} [options] - Optional parameters for decryption, such as `ivLength`.
 * @param {number} [options.ivLength=16] - The length of the initialization vector (IV) to use (default: 16).
 * 
 * @returns {Outcome.Either<Readable, string>} - An `Outcome` containing either the `Readable` stream on success, 
 * or an error message on failure.
 */
export function decryptBufferWithStream (
  encryptedBuffer: Buffer,
  encryptionKey: string,
  algorithm: string = 'aes-256-gcm',
  options?: EncryptDecryptOptions
): Outcome.Either<Readable, string> {
  const fileArray = new Uint8Array(encryptedBuffer)
  return decryptUint8ArrayWithStream(fileArray, encryptionKey, algorithm, options)
}
