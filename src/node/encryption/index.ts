import {
  encryptBuffer,
  decryptBuffer,
  encryptBufferWithStream,
  decryptBufferWithStream
} from './buffer'
import { generateEncryptionKey, GenerateEncryptionKeyOptions } from './generate-key'
import {
  EncryptDecryptOptions,
  encryptUint8Array,
  decryptUint8Array,
  encryptUint8ArrayWithStream,
  decryptUint8ArrayWithStream
} from './uint8-array'

export {
  // Encrypt / decrypt Buffer
  encryptBuffer,
  decryptBuffer,
  encryptBufferWithStream,
  decryptBufferWithStream,

  // Generate encryption key
  generateEncryptionKey,

  // Encrypt / decrypt Uint8Array
  encryptUint8Array,
  decryptUint8Array,
  encryptUint8ArrayWithStream,
  decryptUint8ArrayWithStream
}

export type {
  EncryptDecryptOptions,
  GenerateEncryptionKeyOptions
}
