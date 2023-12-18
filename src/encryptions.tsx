import ReactNativeBlobUtil from 'react-native-blob-util';
import crypto from 'react-native-quick-crypto';
import { Buffer } from 'buffer';
import type { BinaryLike } from 'react-native-quick-crypto/lib/typescript/Utils';

type IEvent = 'LOADING' | 'SUCCESS' | 'FAILURE';
export type IEncryptionPayload = {
  LOADING: { inputFilePath: string; outputFilePath: string };
  SUCCESS: { inputFilePath: string; outputFilePath: string };
  FAILURE: { inputFilePath: string; outputFilePath: string; error: string };
};
export type IEncryptionCallback = <T extends IEvent>(
  event: T,
  payload: IEncryptionPayload[T]
) => void;

// Generate random key and initialization vector (IV) for encryption
const key = Buffer.from('DEFAULT_KEYINPUT');
const ivv = crypto.randomBytes(16);

// Define the buffer size for reading and writing streams
const bufferSize = 1024 * 4;

/**
 * Encrypt file
 * @param inputFilePath source file location path
 * @param outputFilePath destination file location path
 */
export async function encryptFile(
  inputFilePath: string,
  outputFilePath: string,
  callback: IEncryptionCallback
): Promise<void> {
  // Create read and write streams for input and output files
  const readStream = await ReactNativeBlobUtil.fs.readStream(
    inputFilePath,
    'base64',
    bufferSize
  );
  const writeStream = await ReactNativeBlobUtil.fs.writeStream(
    outputFilePath,
    'base64',
    true
  );

  // Create a cipher using AES-128-CBC algorithm with the generated key and IV
  const cipher = crypto.createCipheriv('aes-128-cbc', key, ivv);

  await readStream.open();

  readStream.onError((error) => {
    callback('FAILURE', { inputFilePath, outputFilePath, error });
  });

  // When data is available in the read stream, encrypt and write to the output file
  readStream.onData((chunk) => {
    const encryptedChunk = cipher.update(
      chunk as BinaryLike,
      'base64',
      'base64'
    );
    writeStream.write(encryptedChunk as string);
    callback('LOADING', { inputFilePath, outputFilePath });
  });

  // After reading ends, perform final encryption, write to file, and close the streams
  await new Promise<void>((resolve) => {
    readStream.onEnd(async () => {
      const finalEncryptedChunk = cipher.final('hex');
      await writeStream.write(finalEncryptedChunk);
      await writeStream.close();
      callback('SUCCESS', { inputFilePath, outputFilePath });
      resolve();
    });
  });
}

/**
 * Decrypt file
 * @param inputFilePath source file location path
 * @param outputFilePath destination file location path
 */
export async function decryptFile(
  inputFilePath: string,
  outputFilePath: string,
  callback: IEncryptionCallback
): Promise<void> {
  const readStream = await ReactNativeBlobUtil.fs.readStream(
    inputFilePath,
    'base64',
    bufferSize
  );
  const writeStream = await ReactNativeBlobUtil.fs.writeStream(
    outputFilePath,
    'base64',
    true
  );

  // Create a decipher using AES-128-CBC algorithm with the same key and IV used for encryption
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, ivv);

  await readStream.open();

  readStream.onError((error) => {
    callback('FAILURE', { inputFilePath, outputFilePath, error });
  });

  readStream.onData((chunk) => {
    const decryptedChunk = decipher.update(
      chunk as BinaryLike,
      'base64',
      'base64'
    );
    writeStream.write(decryptedChunk as string);
    callback('LOADING', { inputFilePath, outputFilePath });
  });

  await new Promise<void>((resolve) => {
    readStream.onEnd(async () => {
      const finalDecryptedChunk = decipher.final('base64');
      await writeStream.write(finalDecryptedChunk);
      await writeStream.close();
      callback('SUCCESS', { inputFilePath, outputFilePath });
      resolve();
    });
  });
}
