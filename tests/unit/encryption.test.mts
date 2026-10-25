import assert from 'node:assert/strict'
import test from 'node:test'
import { decrypt, encrypt } from '../../src/lib/security/encryption.ts'

const TEST_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'

test('encryption module encrypts and decrypts round-trip with AES-256-GCM', () => {
  const originalEnv = process.env.APPLICATION_ENCRYPTION_KEY
  process.env.APPLICATION_ENCRYPTION_KEY = TEST_KEY

  try {
    const sensitive = 'postiz_sk_test_secret_1234567890'
    const encrypted = encrypt(sensitive)

    assert.notEqual(encrypted, sensitive)
    assert.ok(typeof encrypted === 'string' && encrypted.length > 32)

    const decrypted = decrypt(encrypted)
    assert.equal(decrypted, sensitive)
  } finally {
    process.env.APPLICATION_ENCRYPTION_KEY = originalEnv
  }
})

test('encryption produces unique ciphertext for identical plaintext due to random IV', () => {
  const originalEnv = process.env.APPLICATION_ENCRYPTION_KEY
  process.env.APPLICATION_ENCRYPTION_KEY = TEST_KEY

  try {
    const text = 'same-token-value'
    const enc1 = encrypt(text)
    const enc2 = encrypt(text)

    assert.notEqual(enc1, enc2)
    assert.equal(decrypt(enc1), text)
    assert.equal(decrypt(enc2), text)
  } finally {
    process.env.APPLICATION_ENCRYPTION_KEY = originalEnv
  }
})

test('tampered ciphertext fails decryption due to GCM authentication tag mismatch', () => {
  const originalEnv = process.env.APPLICATION_ENCRYPTION_KEY
  process.env.APPLICATION_ENCRYPTION_KEY = TEST_KEY

  try {
    const encrypted = encrypt('unmodified-content')
    const buffer = Buffer.from(encrypted, 'base64')
    // Flip a bit in the ciphertext portion
    buffer[buffer.length - 1] ^= 0x01
    const tampered = buffer.toString('base64')

    assert.throws(() => {
      decrypt(tampered)
    })
  } finally {
    process.env.APPLICATION_ENCRYPTION_KEY = originalEnv
  }
})

test('throws clear error when APPLICATION_ENCRYPTION_KEY is missing or invalid', () => {
  const originalEnv = process.env.APPLICATION_ENCRYPTION_KEY
  process.env.APPLICATION_ENCRYPTION_KEY = 'invalid-short-key'

  try {
    assert.throws(
      () => encrypt('test'),
      /APPLICATION_ENCRYPTION_KEY must be a 64-character hex string/,
    )
  } finally {
    process.env.APPLICATION_ENCRYPTION_KEY = originalEnv
  }
})
